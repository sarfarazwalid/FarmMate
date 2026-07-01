"use client";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { useToast } from "@/app/components/ToastProvider";
import Button from '@/app/components/ui/Button';
import { Check, CheckCircle, Clock, Edit, MessageCircle, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getApiUrl } from '@/lib/apiConfig';

export default function CommunityForumPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ type: "question", title: "", content: "" });
  const [replyContent, setReplyContent] = useState({});
  const [posting, setPosting] = useState(false);
  const [replying, setReplying] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [deleting, setDeleting] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, type: null, postId: null, replyId: null });
  const toast = useToast();

  useEffect(() => {
    fetchPosts();
    getCurrentUser();
  }, []);

  const getCurrentUser = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    setCurrentUser(cookies.userId);
  };

  const fetchPosts = async () => {
    setLoading(true);
    const res = await fetch(getApiUrl("/forum"), { credentials: "include" });
    const data = await res.json();
    if (data.success) setPosts(data.data);
    setLoading(false);
  };

  const handlePostChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setPosting(true);
    const res = await fetch(getApiUrl("/forum"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newPost),
    });
    setPosting(false);
    setNewPost({ type: "question", title: "", content: "" });
    if (res.ok) fetchPosts();
    else alert("Failed to post");
  };

  const handleReplyChange = (postId, value) => {
    setReplyContent({ ...replyContent, [postId]: value });
  };

  const handleReply = async (postId) => {
    setReplying({ ...replying, [postId]: true });
    const res = await fetch(getApiUrl(`/forum/${postId}/reply`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: replyContent[postId] }),
    });
    setReplying({ ...replying, [postId]: false });
    setReplyContent({ ...replyContent, [postId]: "" });
    if (res.ok) fetchPosts();
    else alert("Failed to reply");
  };

  const handleEditPost = async (postId, updatedData) => {
    const res = await fetch(getApiUrl(`/forum/${postId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updatedData),
    });
    if (res.ok) {
      setEditingPost(null);
      fetchPosts();
      toast.success("Post updated");
    } else {
      toast.error("Failed to update post");
    }
  };

  const handleDeletePost = async (postId) => {
    setDeleting({ ...deleting, [postId]: true });
    const res = await fetch(getApiUrl(`/forum/${postId}`), {
      method: "DELETE",
      credentials: "include",
    });
    setDeleting({ ...deleting, [postId]: false });
    if (res.ok) {
      toast.success("Post deleted");
      fetchPosts();
    } else {
      toast.error("Failed to delete post");
    }
  };

  const handleEditReply = async (postId, replyId, content) => {
    const res = await fetch(getApiUrl(`/forum/${postId}/reply/${replyId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setEditingReply(null);
      fetchPosts();
    } else {
      alert("Failed to edit reply");
    }
  };

  const handleDeleteReply = async (postId, replyId) => {
    setDeleting({ ...deleting, [replyId]: true });
    const res = await fetch(getApiUrl(`/forum/${postId}/reply/${replyId}`), {
      method: "DELETE",
      credentials: "include",
    });
    setDeleting({ ...deleting, [replyId]: false });
    if (res.ok) {
      toast.success("Reply deleted");
      fetchPosts();
    } else {
      toast.error("Failed to delete reply");
    }
  };

  const openConfirmForPost = (postId) => {
    setConfirmState({ open: true, type: "post", postId, replyId: null });
  };

  const openConfirmForReply = (postId, replyId) => {
    setConfirmState({ open: true, type: "reply", postId, replyId });
  };

  const closeConfirm = () => setConfirmState({ open: false, type: null, postId: null, replyId: null });

  const confirmDeletion = async () => {
    const { type, postId, replyId } = confirmState;
    closeConfirm();
    if (type === "post" && postId) {
      await handleDeletePost(postId);
    } else if (type === "reply" && postId && replyId) {
      await handleDeleteReply(postId, replyId);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Community Forum</h1>
      <form onSubmit={handleCreatePost} className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-4 mb-6">
        <div className="flex gap-2 mb-2">
          <select name="type" value={newPost.type} onChange={handlePostChange} className="border rounded p-2">
            <option value="question">Question</option>
            <option value="experience">Experience</option>
          </select>
          {newPost.type === "question" && (
            <input
              name="title"
              value={newPost.title}
              onChange={handlePostChange}
              placeholder="Title (for questions)"
              className="border rounded p-2 flex-1"
              required
            />
          )}
        </div>
        <textarea
          name="content"
          value={newPost.content}
          onChange={handlePostChange}
          placeholder="Share your question or experience..."
          className="border rounded p-2 w-full mb-2"
          required
        />
        <Button type="submit" disabled={posting}>
          {posting ? "Posting..." : "Post"}
        </Button>
      </form>
      {loading ? (
        <div>Loading posts...</div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-teal-700">{post.author?.name || "Farmer"}</span>
                  <span className="text-xs text-surface-500">{new Date(post.createdAt).toLocaleString()}</span>
                  <span className="ml-2 px-2 py-1 text-xs rounded bg-white/[0.04] text-surface-400">{post.type}</span>
                </div>
                {currentUser === post.author?._id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="text-sky-400 hover:text-sky-300"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openConfirmForPost(post._id)}
                      disabled={deleting[post._id]}
                      className="text-red-400 hover:text-red-300"
                    >
                      {deleting[post._id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              {editingPost?._id === post._id ? (
                <div className="mb-4">
                  {post.type === "question" && (
                    <input
                      value={editingPost.title}
                      onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                      className="border rounded p-2 w-full mb-2"
                      placeholder="Title"
                    />
                  )}
                  <textarea
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                    className="border rounded p-2 w-full mb-2"
                    placeholder="Content"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPost(post._id, {
                        title: editingPost.title,
                        content: editingPost.content
                      })}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-3 py-1 rounded text-sm"
                    >
                      <Check className="w-4 h-4 inline mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPost(null)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {post.type === "question" && <div className="font-bold mb-1">{post.title}</div>}
                  <div className="mb-2 whitespace-pre-line">{post.content}</div>
                </>
              )}
              
              <div className="ml-4 border-l-2 border-teal-100 pl-4 space-y-2">
                {post.replies?.map((reply) => (
                  <div key={reply._id} className="bg-white/[0.02] rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-teal-400">{reply.author?.name || "Farmer"}</span>
                        <span className="text-xs text-surface-500">{new Date(reply.createdAt).toLocaleString()}</span>
                      </div>
                      {currentUser === reply.author?._id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingReply({...reply, postId: post._id})}
                            className="text-sky-400 hover:text-sky-300"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openConfirmForReply(post._id, reply._id)}
                            disabled={deleting[reply._id]}
                            className="text-red-400 hover:text-red-300"
                          >
                            {deleting[reply._id] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    {editingReply?._id === reply._id ? (
                      <div>
                        <textarea
                          value={editingReply.content}
                          onChange={(e) => setEditingReply({...editingReply, content: e.target.value})}
                          className="border rounded p-2 w-full mb-2"
                          placeholder="Reply content"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReply(post._id, reply._id, editingReply.content)}
                            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-2 py-1 rounded text-xs"
                          >
                            <Check className="w-3 h-3 inline mr-1" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingReply(null)}
                            className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
                          >
                            <X className="w-3 h-3 inline mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>{reply.content}</div>
                    )}
                  </div>
                ))}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Reply..."
                    value={replyContent[post._id] || ""}
                    onChange={e => handleReplyChange(post._id, e.target.value)}
                    className="border rounded p-2 flex-1"
                  />
                  <Button
                    onClick={() => handleReply(post._id)}
                    disabled={replying[post._id] || !replyContent[post._id]}
                    className="px-3 py-1"
                  >
                    {replying[post._id] ? "Replying..." : "Reply"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.type === "post" ? "Delete post?" : "Delete reply?"}
        description={confirmState.type === "post" ? "This will permanently remove the post and its replies." : "This will permanently remove the reply."}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeletion}
        onCancel={closeConfirm}
      />
    </div>
  );
}