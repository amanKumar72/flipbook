"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Mail, Link, Trash2, Calendar, Loader } from "lucide-react";
import { EmailShareModal } from "./EmailShareModal";

interface Flipbook {
  _id: string;
  title: string;
  description: string;
  spreads: any[];
  createdAt: string;
}

interface BookListProps {
  onSelectTab: (tab: "list" | "create") => void;
}

export function BookList({ onSelectTab }: BookListProps) {
  const [books, setBooks] = useState<Flipbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Share Modal State
  const [selectedBook, setSelectedBook] = useState<{ id: string; title: string } | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/books");
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      } else {
        setError("Failed to load albums.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching albums.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleCopyLink = (bookId: string) => {
    const origin = window.location.origin;
    const link = `${origin}/viewer/${bookId}`;
    navigator.clipboard.writeText(link);
    alert("Shareable album link copied to clipboard!");
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this album? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBooks(books.filter((b) => b._id !== bookId));
      } else {
        alert("Failed to delete album.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-3">
        <Loader className="animate-spin text-amber-500" size={32} />
        <span className="font-serif italic text-sm text-amber-200/60">Loading your albums...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-rose-500 bg-rose-500/5 border border-rose-500/10 rounded-lg p-6 max-w-md mx-auto">
        <p className="font-serif font-semibold">{error}</p>
        <button
          onClick={fetchBooks}
          className="mt-4 px-4 py-1.5 rounded border border-rose-500/30 text-xs uppercase font-mono tracking-wider text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Dynamic Wreath Badge & Create CTA if empty */}
      {books.length === 0 ? (
        <div className="text-center py-16 border border-stone-800/80 rounded-xl bg-black/20 p-8 max-w-xl mx-auto flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full border border-amber-500/20 flex items-center justify-center text-amber-500/40 text-2xl">
            🌿
          </div>
          <div className="space-y-1.5">
            <h4 className="font-serif text-lg text-stone-200 font-semibold uppercase tracking-wider">
              No Wedding Albums Created
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              Create your first luxury digital wedding album by uploading photos from your ceremonies!
            </p>
          </div>
          <button
            onClick={() => onSelectTab("create")}
            className="px-6 py-2.5 rounded bg-amber-600 hover:bg-amber-500 text-black font-semibold text-xs tracking-wider uppercase active:scale-95 transition-all shadow-md shadow-amber-500/5"
          >
            Create New Album
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const formattedDate = new Date(book.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={book._id}
                className="relative bg-gradient-to-br from-[#1c1410] to-[#0c0908] border border-amber-500/10 rounded-xl p-5 flex flex-col justify-between shadow-lg hover:border-amber-500/30 transition-all duration-300 group"
              >
                {/* Gold Crest Ribbon Corner */}
                <div className="absolute top-4 right-4 text-[10px] font-mono tracking-wider text-amber-500/50 uppercase border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {book.spreads.length * 2} Pages
                </div>

                {/* Body Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 text-sm font-serif">❦</span>
                    <h3 className="font-serif text-lg font-bold text-amber-100 uppercase tracking-wide group-hover:text-amber-400 transition-colors line-clamp-1">
                      {book.title}
                    </h3>
                  </div>

                  <p className="text-xs text-stone-400 leading-relaxed min-h-[36px] line-clamp-2">
                    {book.description || "A custom digital wedding flipbook."}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono">
                    <Calendar size={12} className="text-amber-500/50" />
                    <span>Created: {formattedDate}</span>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-amber-500/10">
                  <a
                    href={`/viewer/${book._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/5 rounded text-amber-400 hover:text-white text-[10px] uppercase font-mono tracking-wider transition-all"
                  >
                    <BookOpen size={12} />
                    View Album
                  </a>

                  <button
                    onClick={() => setSelectedBook({ id: book._id, title: book.title })}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 border border-stone-800 hover:border-stone-700 hover:bg-stone-900 rounded text-stone-400 hover:text-white text-[10px] uppercase font-mono tracking-wider transition-all"
                  >
                    <Mail size={12} className="text-amber-500/60" />
                    Invite Guest
                  </button>

                  <button
                    onClick={() => handleCopyLink(book._id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 border border-stone-800 hover:border-stone-700 hover:bg-stone-900 rounded text-stone-400 hover:text-white text-[10px] uppercase font-mono tracking-wider transition-all"
                  >
                    <Link size={12} />
                    Copy Link
                  </button>

                  <button
                    onClick={() => handleDelete(book._id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 border border-rose-950/20 hover:border-rose-500/50 hover:bg-rose-500/5 rounded text-rose-500/80 hover:text-rose-400 text-[10px] uppercase font-mono tracking-wider transition-all"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guest Nodemailer Email Modal */}
      {selectedBook && (
        <EmailShareModal
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          bookId={selectedBook.id}
          defaultTitle={selectedBook.title}
        />
      )}
    </div>
  );
}
