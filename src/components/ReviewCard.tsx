import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Review } from '../types';

const ReviewCard = ({ review }: { review: Review }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="surface rounded-3xl p-6"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-navy-600 grid place-items-center text-white font-bold shrink-0">
        {review.profiles?.full_name?.charAt(0) || 'A'}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-ink truncate">{review.profiles?.full_name || 'Anonymous'}</p>
        <p className="text-xs text-ink-faint">
          {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-ink-faint/40'}`} />
        ))}
      </div>
    </div>

    {review.recommend != null && (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${
          review.recommend ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'
        }`}
      >
        {review.recommend ? <ThumbsUp className="w-3.5 h-3.5" /> : <ThumbsDown className="w-3.5 h-3.5" />}
        {review.recommend ? 'Positive — recommends' : 'Negative — does not recommend'}
      </span>
    )}

    {review.comment ? (
      <p className="text-ink-soft text-sm leading-relaxed">{review.comment}</p>
    ) : (
      <p className="text-ink-faint text-sm italic">No comment provided</p>
    )}
  </motion.div>
);

export default ReviewCard;
