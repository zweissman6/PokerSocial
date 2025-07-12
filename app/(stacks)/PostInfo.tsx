// /app/(stacks)/PostInfo.tsx

import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton, Menu, TextInput } from 'react-native-paper';
import { useUser } from '../context/UserContext';

const API_URL = 'http://192.168.1.240:4000/sessions';

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

  const fetchComments = async () => {
    const res = await axios.get(`${API_URL}/${postId}/comments`);
    setComments(res.data);
  };

  //usestates for likes
  const [rungoodCount, setRungoodCount] = useState(0);
  const [rungoodUsers, setRungoodUsers] = useState<{ _id: string, userName: string, avatar: string }[]>([]); // Array of user objects
  const [hasRungood, setHasRungood] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  // TODO: Detect if current user is owner
  const isOwner = user && post && user._id === post.userId._id;

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
      const postRes = await axios.get(`${API_URL}/${postId}`);
      setPost(postRes.data);
      setComments(postRes.data.comments || []);

      const rungoodRes = await axios.get(`${API_URL}/${postId}/rungood`);
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
    await axios.post(`${API_URL}/${postId}/comments`, {
      userId: user._id,
      text: comment,
    });
    setComment('');
    setReplyingTo(null);
    fetchComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user?._id) return;
    await axios.delete(`${API_URL}/${postId}/comments/${commentId}?userId=${user._id}`);
    fetchComments();
  };


const handleRungood = async () => {
  if (!user || !user._id) return;
  try {
    // Await the backend, and update with what it sends!
    const res = await axios.post(`${API_URL}/${postId}/rungood`, { userId: user._id });
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
          <Image source={{ uri: post.userId.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{post.userId.userName}</Text>
            <Text style={styles.cardroom}>{post.userId.favoriteCardroom}</Text>
          </View>
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
              <Menu.Item onPress={handleDelete} title="Delete (coming soon)" />
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
              <Image source={{ uri: c.user.avatar }} style={styles.commentAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.commentUser}>{c.user.userName}</Text>
                <Text style={styles.commentText}>{c.text}</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 3 }}>
                  {/* Reply (auto-inserts @username in box) */}
                  <TouchableOpacity
                    onPress={() => setReplyingTo({ userName: c.user.userName })}
                  >
                    <Text style={{ color: '#ffd700', fontWeight: 'bold' }}>Reply</Text>
                  </TouchableOpacity>
                  {/* Delete only for own comments */}
                  {user && user._id === c.user._id && (
                    <TouchableOpacity onPress={() => handleDeleteComment(c._id)}>
                      <Text style={{ color: 'red' }}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
          {/* Add Comment/Reply Box */}
          <View style={styles.addCommentRow}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder={replyingTo ? `Replying to @${replyingTo.userName}` : "Add a comment..."}
              style={styles.commentInput}
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
  commentInput: { flex: 1, backgroundColor: '#232323', color: '#fff', borderRadius: 7, paddingHorizontal: 12, height: 36, fontSize: 14 },
  sendButton: { marginLeft: 10, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#232323', borderRadius: 6 }
});
