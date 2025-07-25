// /app/(stacks)/PostInfo.tsx

import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton, Menu, Modal, Portal, TextInput } from 'react-native-paper';
import { useUser } from '../context/UserContext';

const API_URL = 'http://192.168.1.240:4000';

type PostType = {
  _id: string;
  userId: {
    _id: string;
    userName: string;
    avatar: string;
    favoriteCardroom: string;
  };
  stakes: string;
  gameType: string;
  location: string;
  buyIn: number;
  cashOut: number;
  date: string;
  photo?: string;
  description?: string;
  rungood?: number;
  comments?: any[];
};

export default function PostInfo() {
  const router = useRouter();
  const { user } = useUser()
  const { postId } = useLocalSearchParams();

  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<null | { userName: string }>(null);
  const commentInputRef = useRef<any>(null);
  // For showing the list of likes in a modal
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likesModalUsers, setLikesModalUsers] = useState<{ _id: string, userName: string, avatar: string }[]>([]);



  const fetchComments = async () => {
    const res = await axios.get(`${API_URL}/sessions/${postId}/comments`);
    setComments(res.data);
  };

  //usestates for likes
  const [rungoodCount, setRungoodCount] = useState(0);
  const [rungoodUsers, setRungoodUsers] = useState<{ _id: string, userName: string, avatar: string }[]>([]); // Array of user objects
  const [hasRungood, setHasRungood] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  // TODO: Detect if current user is owner
  const isOwner = user && post && user._id === post.userId._id;

  const fetchUserIdByUsername = async (userName: string): Promise<string | null> => {
    try {
      const res = await axios.get(`${API_URL}/users/username/${encodeURIComponent(userName)}`);
      return res.data?._id || null;
    } catch (e) {
      console.log('Failed to fetch user by username', e);
      return null;
    }
  };

  // Go to user profile by username
  const goToUserProfile = async (userName: string) => {
    if (!userName) return;
    try {
      // You could optimize to skip if userName === user.userName, but this works generally!
      const userId = await fetchUserIdByUsername(userName);
      if (userId) {
        router.push({ pathname: '/(stacks)/UserProfile', params: { username: userName } });
      } else {
        Alert.alert('User not found', `Could not find user: ${userName}`);
      }
    } catch {
      Alert.alert('User not found', `Could not find user: ${userName}`);
    }
  };



  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPostAndRungood();
    setRefreshing(false);
  };

  const fetchPostAndRungood = async () => {
    if (!postId || !user || !user._id) return;
    setLoading(true);
    setError(null);

    try {
      const postRes = await axios.get(`${API_URL}/sessions/${postId}`);
      setPost(postRes.data);

      // REMOVE this line (don't get comments from the post!):
      // setComments(postRes.data.comments || []);

      const rungoodRes = await axios.get(`${API_URL}/sessions/${postId}/rungood`);
      setRungoodCount(rungoodRes.data.count);
      setRungoodUsers(rungoodRes.data.users);
      setHasRungood(rungoodRes.data.users.some((u: { _id: string }) => u._id === user._id));
    } catch (e) {
      setError('Could not load post');
      setRungoodCount(0);
      setRungoodUsers([]);
      setHasRungood(false);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    fetchPostAndRungood();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, user && user._id]);

  const handleAddComment = async () => {
    if (!comment.trim() || !user?._id) return;
    await axios.post(`${API_URL}/sessions/${postId}/comments`, {
      userId: user._id,
      text: comment,
    });
    setComment('');
    commentInputRef.current?.clear();
    fetchComments();
  };

const handleDeletePost = async () => {
  if (!post?._id || !user?._id) return; // early return if missing
  Alert.alert(
    "Delete Post",
    "Are you sure you want to delete this post? This action cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await axios.delete(`${API_URL}/sessions/${post._id}?userId=${user._id}`);
            router.replace('/');
          } catch (e) {
            Alert.alert("Error", "Could not delete post. Please try again.");
          }
        }
      }
    ]
  );
};






  const handleDeleteComment = async (commentId: string) => {
    if (!user?._id) return;
    await axios.delete(`${API_URL}/sessions/${postId}/comments/${commentId}?userId=${user._id}`);
    fetchComments();
  };


const handleRungood = async () => {
  if (!user || !user._id) return;
  try {
    // Await the backend, and update with what it sends!
    const res = await axios.post(`${API_URL}/sessions/${postId}/rungood`, { userId: user._id });
    setRungoodCount(res.data.count);
    setRungoodUsers(res.data.users);
    setHasRungood(res.data.users.some((u: { _id: string }) => u._id === user._id));
  } catch (err) {
    Alert.alert("Error", "Could not update RunGood. Please try again.");
  }
};
    

  function handleDelete() {
    Alert.alert("Delete", "Delete post (coming soon)");
    setMenuVisible(false);
  }

  function handleEdit() {
    Alert.alert("Edit", "Edit post (coming soon)");
    setMenuVisible(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ffd700" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error || "Post not found."}</Text>
      </View>
    );
  }

  return (
    
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // adjust as needed!
    >
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'‹'}</Text>
        </TouchableOpacity>
        <View style={styles.userRow}>
          <TouchableOpacity
            onPress={() => goToUserProfile(post.userId.userName)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Image source={{ uri: post.userId.avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.username}>{post.userId.userName}</Text>
              <Text style={styles.cardroom}>{post.userId.favoriteCardroom}</Text>
            </View>
          </TouchableOpacity>
        </View>
          {isOwner ? (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuIcon}
                />
              }
              contentStyle={styles.menuContent}
            >
              <Menu.Item onPress={handleEdit} title="Edit (coming soon)" />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  handleDeletePost();
                }}
                title="Delete"
                titleStyle={{ color: 'red', fontWeight: 'bold' }}
              />
            </Menu>
          ) : (
            // If not owner, add a placeholder view to keep spacing consistent
            <View style={{ width: 40 }} />
          )}
      </View>

      <ScrollView 
        style={styles.scroll}  
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffd700"
          />
        }
      >
        {post.photo && (
          <Image source={{ uri: post.photo }} style={styles.photo} />
        )}
        <View style={styles.details}>
          <Text style={styles.sessionMeta}>{post.stakes} {post.gameType} • {post.location}</Text>
          <Text style={styles.sessionMeta}>{post.date}</Text>
          <Text style={styles.sessionInfo}>
            Buy-in: ${post.buyIn} | Cash-out: ${post.cashOut}
          </Text>
          <Text style={styles.description}>{post.description}</Text>
        </View>

        {/* RunGood (Like) Button */}
        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[
              styles.rungoodButton,
              hasRungood && { backgroundColor: '#ffd70022', borderWidth: 1, borderColor: '#ffd700' }
            ]}
            onPress={handleRungood}
          >
            <Text style={styles.chipIcon}>🍀</Text>
            <Text style={styles.chipCount}>
              {rungoodCount} RunGood
            </Text>
          </TouchableOpacity>
          {rungoodUsers.length > 0 && (
            <View style={{ marginLeft: 10 }}>
              <Text style={{ color: '#aaa', fontSize: 13 }}>from:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {rungoodUsers.slice(-5).reverse().map(u => (
                  <View key={u._id} style={{ alignItems: 'center', marginRight: 8 }}>
                    <Image
                      source={{ uri: u.avatar }}
                      style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#ffd700' }}
                    />
                    <Text style={{ color: '#ffd700', fontSize: 11 }}>{u.userName}</Text>
                  </View>
                ))}
                {rungoodUsers.length > 5 && (
                  <Text style={{ color: '#ffd700', fontSize: 13, marginLeft: 3 }}>
                    +{rungoodUsers.length - 5} more
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>


        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>Table Talk</Text>
          {comments.map((c: any) => (
            <View key={c._id} style={styles.commentRow}>
              <TouchableOpacity
                onPress={() => goToUserProfile(c.user.userName)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: c.user.avatar }} style={styles.commentAvatar} />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  onPress={() => goToUserProfile(c.user.userName)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.commentUser}>{c.user.userName}</Text>
                </TouchableOpacity>

                {/*Redirect for replies*/}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                  {c.text.startsWith('@') && c.text.indexOf(' ') > 0 ? (
                    <>
                      <TouchableOpacity
                        onPress={async () => {
                          const username = c.text.slice(1, c.text.indexOf(' '));
                          const userId = await fetchUserIdByUsername(username);
                          if (userId) {
                            router.push({ pathname: '/(stacks)/UserProfile', params: { username } })
                          } else {
                            Alert.alert('User not found', `Could not find user: ${username}`);
                          }
                        }}>
                        <Text style={{ color: '#ffd700', fontWeight: 'bold' }}>
                          {c.text.slice(0, c.text.indexOf(' ') + 1)}
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.commentText}>{c.text.slice(c.text.indexOf(' ') + 1)}</Text>
                    </>
                  ) : (
                    <Text style={styles.commentText}>{c.text}</Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 3 }}>                 
                  {/* Reply Button */}
                  <TouchableOpacity
                    onPress={() => {
                      setComment(`@${c.user.userName} `);
                      setReplyingTo(null);
                      commentInputRef.current?.focus && commentInputRef.current.focus();
                    }}
                  >
                    <Text style={{ color: '#ffd700', fontWeight: 'bold' }}>Reply</Text>
                  </TouchableOpacity>
                  
                  {/* Delete only for own comments */}
                  {user && user._id === c.user._id && (
                    <TouchableOpacity onPress={() => handleDeleteComment(c._id)}>
                      <Text style={{ color: 'red' }}>Delete</Text>
                    </TouchableOpacity>
                  )}
                  {/* Like Button for Comments */}
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={async () => {
                      if (!user?._id) return;
                      const liked = c.likes?.includes(user._id);
                      try {
                        if (!liked) {
                          await axios.post(`${API_URL}/sessions/${postId}/comments/${c._id}/like`, { userId: user._id });
                        } else {
                          await axios.post(`${API_URL}/sessions/${postId}/comments/${c._id}/unlike`, { userId: user._id });
                        }
                        fetchComments();
                      } catch (e) {
                        Alert.alert("Error", "Could not update like.");
                      }
                    }}
                    onLongPress={async () => {
                      try {
                        const res = await axios.get(`${API_URL}/sessions/${postId}/comments/${c._id}/likes`);
                        setLikesModalUsers(res.data);  // Expect array of { _id, userName, avatar }
                      } catch (e) {
                        setLikesModalUsers([]); // fallback to empty
                      }
                      setShowLikesModal(true);
                    }}
                  >
                    <Text style={{
                      color: user && c.likes?.includes(user._id) ? "#ffd700" : "#aaa",
                      fontWeight: "bold",
                      fontSize: 15,
                      marginRight: 4
                    }}>👍</Text>
                    <Text style={{ color: "#ffd700", fontSize: 13 }}>
                      {c.likes?.length || 0}
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          ))}
          {/* Add Comment/Reply Box */}
          <View style={styles.addCommentRow}>
            <TextInput
              ref={commentInputRef}
              value={comment}
              onChangeText={setComment}
              placeholder="Add a comment..."
              style={[styles.commentInput, { height: 36 }]}
              multiline
              scrollEnabled={true}
              placeholderTextColor="#999"
            />
            {replyingTo && (
              <TouchableOpacity
                onPress={() => {
                  setComment(`@${replyingTo.userName} `);
                  setReplyingTo(null);
                }}
              >
                <Text style={{ color: '#aaa', marginRight: 4 }}>@</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleAddComment} style={styles.sendButton}>
              <Text style={{ color: '#ffd700', fontWeight: 'bold' }}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
    <Portal>
      <Modal
        visible={showLikesModal}
        onDismiss={() => setShowLikesModal(false)}
        contentContainerStyle={{
          backgroundColor: "#232323",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          padding: 18,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          minHeight: 100,
          maxHeight: '33%',
        }}
      >
        <Text style={{
          color: "#ffd700",
          fontWeight: "bold",
          fontSize: 17,
          marginBottom: 12,
          textAlign: "center"
        }}>Liked by</Text>
        <ScrollView>
          {likesModalUsers.length === 0 && (
            <Text style={{ color: "#aaa", textAlign: "center" }}>No likes yet</Text>
          )}
          {likesModalUsers.map(u => (
            <View key={u._id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Image source={{ uri: u.avatar }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10, borderWidth: 1, borderColor: "#ffd700" }} />
              <Text style={{ color: "#ffd700", fontWeight: "bold", fontSize: 15 }}>{u.userName}</Text>
            </View>
          ))}
        </ScrollView>
      </Modal>
    </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181818' },
  scroll: { padding: 16 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 55 : 12, paddingHorizontal: 8,
    justifyContent: 'space-between', backgroundColor: '#1a1a1a'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818', // match your main background if you want
  },
  backButton: { padding: 6, marginRight: 8 },
  backButtonText: { color: '#ffd700', fontSize: 30, fontWeight: 'bold' },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 19, marginRight: 9, borderWidth: 2, borderColor: '#ffd700' },
  username: { color: '#ffd700', fontWeight: 'bold', fontSize: 16 },
  cardroom: { color: '#bbb', fontSize: 13 },
  menuIcon: { marginLeft: 0 },
  menuContent: { backgroundColor: '#232323' },
  photo: { width: '100%', height: 200, borderRadius: 12, marginVertical: 12 },
  details: { marginBottom: 8 },
  sessionMeta: { color: '#aaa', fontSize: 14, marginTop: 4 },
  sessionInfo: { color: '#ffd700', fontSize: 15, fontWeight: 'bold', marginTop: 5 },
  description: { color: '#fff', marginTop: 8, fontSize: 15 },
  chipRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  rungoodButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#232323', borderRadius: 8, padding: 7, marginRight: 10 },
  chipIcon: { fontSize: 18, marginRight: 6 },
  chipCount: { color: '#ffd700', fontWeight: 'bold', fontSize: 15 },
  commentsSection: { marginTop: 18 },
  commentsHeader: { color: '#ffd700', fontSize: 17, fontWeight: 'bold', marginBottom: 10 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10, borderWidth: 1, borderColor: '#ffd700' },
  commentUser: { color: '#ffd700', fontWeight: 'bold', fontSize: 14 },
  commentText: { color: '#fff', fontSize: 14, marginBottom: 3 },
  replyRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 26, marginBottom: 2 },
  replyAvatar: { width: 22, height: 22, borderRadius: 11, marginRight: 6, borderWidth: 1, borderColor: '#ffd700' },
  replyUser: { color: '#bbb', fontWeight: 'bold', fontSize: 13, marginRight: 6 },
  replyText: { color: '#ddd', fontSize: 13 },
  addCommentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  commentInput: { flex: 1, backgroundColor: '#232323', color: '#fff', borderRadius: 7, paddingHorizontal: 12, fontSize: 14},
  sendButton: { marginLeft: 10, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#232323', borderRadius: 6 },
  mentionText: { color: '#ffd700', fontWeight: 'bold' }
});
