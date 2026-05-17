export default function OnlineStatusDot({ isOnline }) {
    return (
        <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shrink-0 ${
            isOnline ? 'bg-green-400' : 'bg-gray-300'
        }`} />
    );
}