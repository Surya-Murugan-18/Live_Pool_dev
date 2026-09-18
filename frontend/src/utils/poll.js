export function totalVotes(options) {
    return options.reduce((sum, option) => sum + option.votes, 0);
}
export function percentage(votes, total) {
    if (total <= 0)
        return 0;
    return Math.round(votes / total * 100);
}
export function leadingOptionId(options) {
    if (options.length === 0)
        return null;
    return options.reduce((best, option) => option.votes > best.votes ? option : best, options[0]).id;
}
export function formatCreatedAt(iso) {
    const date = new Date(`${iso}T12:00:00`);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
export function formatLongDate(iso) {
    const date = new Date(`${iso}T12:00:00`);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
export function pollUrl(pollId) {
    const origin =
        typeof window !== 'undefined'
            ? window.location.origin
            : (import.meta.env.VITE_APP_URL || 'http://localhost:5173');
    return `${origin}/poll/${pollId}`;
}
export function pluralize(count, singular, plural) {
    return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}
/** Weighted pick so the busiest options keep pulling ahead, like real traffic. */
export function pickWeightedOptionId(poll) {
    const weights = poll.options.map((option) => option.votes + 6);
    const sum = weights.reduce((a, b) => a + b, 0);
    let target = Math.random() * sum;
    for (let i = 0; i < poll.options.length; i += 1) {
        target -= weights[i];
        if (target <= 0)
            return poll.options[i].id;
    }
    return poll.options[poll.options.length - 1].id;
}
export function relativeTime(from, now) {
    const seconds = Math.max(0, Math.round((now - from) / 1000));
    if (seconds < 5)
        return 'just now';
    if (seconds < 60)
        return `${seconds}s ago`;
    const minutes = Math.round(seconds / 60);
    return `${minutes}m ago`;
}
