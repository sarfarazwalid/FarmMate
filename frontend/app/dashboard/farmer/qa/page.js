"use client";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { useToast } from "@/app/components/ToastProvider";
import Button from '@/app/components/ui/Button';
import { Check, CheckCircle, Clock, Edit, MessageCircle, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getApiUrl } from '@/lib/apiConfig';

export default function QAPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleting, setDeleting] = useState({});
  const [currentFarmer, setCurrentFarmer] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, questionId: null });
  const toast = useToast();

  useEffect(() => {
    fetchQuestions();
    getCurrentFarmer();
  }, []);

  const getCurrentFarmer = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    setCurrentFarmer(cookies.userId);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    const res = await fetch(getApiUrl("/qa/farmer"), { credentials: "include" });
    const data = await res.json();
    if (data.success) setQuestions(data.data);
    setLoading(false);
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setAsking(true);
    const res = await fetch(getApiUrl("/qa/ask"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ question: newQuestion }),
    });
    setAsking(false);
    setNewQuestion("");
    if (res.ok) {
      toast.success("Question posted");
      fetchQuestions();
    } else {
      toast.error("Failed to ask question");
    }
  };

  const handleEditQuestion = async (questionId, updatedQuestion) => {
    const res = await fetch(getApiUrl(`/qa/${questionId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ question: updatedQuestion }),
    });
    if (res.ok) {
      setEditingQuestion(null);
      fetchQuestions();
      toast.success("Question updated");
    } else {
      toast.error("Failed to update question");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    setDeleting({ ...deleting, [questionId]: true });
    const res = await fetch(getApiUrl(`/qa/${questionId}`), {
      method: "DELETE",
      credentials: "include",
    });
    setDeleting({ ...deleting, [questionId]: false });
    if (res.ok) {
      toast.success("Question deleted");
      fetchQuestions();
    } else {
      toast.error("Failed to delete question");
    }
  };

  const openConfirmForQuestion = (questionId) => {
    setConfirmState({ open: true, questionId });
  };

  const closeConfirm = () => setConfirmState({ open: false, questionId: null });

  const confirmDeletion = async () => {
    const { questionId } = confirmState;
    closeConfirm();
    if (questionId) await handleDeleteQuestion(questionId);
  };

  const unanswered = questions.filter(q => q.status !== 'answered');
  const answered = questions.filter(q => q.status === 'answered');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Q&A Support</h1>
      {/* Ask Question Form */}
      <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Ask a Question</h2>
        <form onSubmit={handleAskQuestion}>
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask your question here..."
            className="border rounded p-3 w-full mb-4"
            rows="4"
            required
          />
          <Button type="submit" disabled={asking || !newQuestion.trim()}>
            {asking ? "Asking..." : "Ask Question"}
          </Button>
        </form>
      </div>
      <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Unanswered Questions</h2>
        {loading ? (
          <div className="text-center py-8">Loading questions...</div>
        ) : unanswered.length === 0 ? (
          <div className="text-center py-8 text-surface-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-surface-400" />
            <p>No unanswered questions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unanswered.map((qa) => (
              <div key={qa._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="px-2 py-1 text-xs rounded bg-amber-500/10 text-amber-300">Pending</span>
                    <span className="text-xs text-surface-500">{new Date(qa.createdAt).toLocaleDateString()}</span>
                  </div>
                  {((qa.farmer?._id === currentFarmer || qa.farmer === currentFarmer)) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingQuestion(qa)}
                        className="text-sky-400 hover:text-sky-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openConfirmForQuestion(qa._id)}
                        disabled={deleting[qa._id]}
                        className="text-red-400 hover:text-red-300"
                      >
                        {deleting[qa._id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                {editingQuestion?._id === qa._id ? (
                  <div className="mb-4">
                    <textarea
                      value={editingQuestion.question}
                      onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                      className="border rounded p-2 w-full mb-2"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditQuestion(qa._id, editingQuestion.question)}
                        className="px-3 py-1"
                      >
                        <Check className="w-4 h-4 inline mr-1" />
                        Save
                      </Button>
                      <Button onClick={() => setEditingQuestion(null)} variant="secondary" className="px-3 py-1">
                        <X className="w-4 h-4 inline mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    <h3 className="font-semibold text-white mb-2">Question:</h3>
                    <p className="text-surface-300 whitespace-pre-line">{qa.question}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
        <h2 className="text-lg font-semibold mb-4">Answered Questions</h2>
        {loading ? (
          <div className="text-center py-8">Loading questions...</div>
        ) : answered.length === 0 ? (
          <div className="text-center py-8 text-surface-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-surface-400" />
            <p>No answered questions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {answered.map((qa) => (
              <div key={qa._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="px-2 py-1 text-xs rounded bg-emerald-500/10 text-emerald-300">Answered</span>
                    <span className="text-xs text-surface-500">{new Date(qa.createdAt).toLocaleDateString()}</span>
                  </div>
                  {qa.farmer?._id === currentFarmer && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingQuestion(qa)}
                        className="text-sky-400 hover:text-sky-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openConfirmForQuestion(qa._id)}
                        disabled={deleting[qa._id]}
                        className="text-red-400 hover:text-red-300"
                      >
                        {deleting[qa._id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                {editingQuestion?._id === qa._id ? (
                  <div className="mb-4">
                    <textarea
                      value={editingQuestion.question}
                      onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                      className="border rounded p-2 w-full mb-2"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditQuestion(qa._id, editingQuestion.question)}
                        className="px-3 py-1"
                      >
                        <Check className="w-4 h-4 inline mr-1" />
                        Save
                      </Button>
                      <Button onClick={() => setEditingQuestion(null)} variant="secondary" className="px-3 py-1">
                        <X className="w-4 h-4 inline mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    <h3 className="font-semibold text-white mb-2">Question:</h3>
                    <p className="text-surface-300 whitespace-pre-line">{qa.question}</p>
                  </div>
                )}
                {qa.answer && (
                  <div className="bg-emerald-500/5 border-l-4 border-green-400 p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Answer:</h3>
                    <p className="text-emerald-300 whitespace-pre-line">{qa.answer}</p>
                    <div className="mt-2 text-sm text-emerald-400">
                      Answered by {qa.admin?.name || 'Admin'} on {new Date(qa.answeredAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title="Delete question?"
        description="This will permanently remove the question."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeletion}
        onCancel={closeConfirm}
      />
    </div>
  );
} 