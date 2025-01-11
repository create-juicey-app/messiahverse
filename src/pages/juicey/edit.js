import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function EditMood() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [moodData, setMoodData] = useState({
    gridPosition: 0,
    mentalWellness: 50,
    tiredness: 50
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    const checkAuth = async () => {
      const res = await fetch('/api/mood/auth', { credentials: 'include' });
      const data = await res.json();
      if (!data.canEdit) {
        router.push('/juicey');
      } else {
        const moodRes = await fetch('/api/mood');
        const moodData = await moodRes.json();
        setMoodData(moodData);
      }
    };

    checkAuth();
  }, [session, status, router]);

  const getCellBackground = (index) => {
    const row = Math.floor(index / 6);
    const col = index % 6;
    
    // Calculate distance from each corner (0 to 1)
    const distHappy = Math.sqrt(Math.pow(row/5, 2) + Math.pow(1 - col/5, 2)) / Math.sqrt(2);
    const distAngry = Math.sqrt(Math.pow(row/5, 2) + Math.pow(col/5, 2)) / Math.sqrt(2);
    const distSad = Math.sqrt(Math.pow(1 - row/5, 2) + Math.pow(col/5, 2)) / Math.sqrt(2);
    const distCalm = Math.sqrt(Math.pow(1 - row/5, 2) + Math.pow(1 - col/5, 2)) / Math.sqrt(2);

    // Convert distances to influences (closer = stronger)
    const happy = 1 - distHappy;
    const angry = 1 - distAngry;
    const sad = 1 - distSad;
    const calm = 1 - distCalm;
    const total = happy + angry + sad + calm;

    // Mix colors based on influence
    const r = Math.round((239 * angry + 234 * happy + 59 * sad + 34 * calm) / total);
    const g = Math.round((68 * angry + 179 * happy + 130 * sad + 197 * calm) / total);
    const b = Math.round((68 * angry + 8 * happy + 246 * sad + 94 * calm) / total);
    
    return {
      background: `rgb(${r}, ${g}, ${b})`,
      opacity: index === moodData.gridPosition ? '1' : '0.7',
      border: index === moodData.gridPosition ? '3px solid white' : 'none',
      boxShadow: index === moodData.gridPosition ? '0 0 10px rgba(0,0,0,0.5)' : 'none'
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(moodData),
    });

    if (res.ok) {
      router.push('/juicey');
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Update Your Mood</h1>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="relative">
          <h2 className="text-lg sm:text-xl mb-4">Select Mood Position</h2>
          <div className="grid grid-cols-6 gap-1 w-full max-w-[24rem] aspect-square mx-auto bg-gray-100 dark:bg-gray-800 relative">
            {Array.from({ length: 36 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMoodData({ ...moodData, gridPosition: i })}
                style={getCellBackground(i)}
                className="transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:opacity-100 relative"
              >
                {/* Add corner labels inside the grid */}
                {i === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold mood-text">
                    Angry
                  </div>
                )}
                {i === 5 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold mood-text">
                    Happy
                  </div>
                )}
                {i === 30 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold mood-text">
                    Sad
                  </div>
                )}
                {i === 35 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold mood-text">
                    Calm
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xl mb-2">
              Mental Wellness: {moodData.mentalWellness}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={moodData.mentalWellness}
              onChange={(e) => setMoodData({ ...moodData, mentalWellness: e.target.value })}
              className="w-full" />
          </div>

          <div></div>
          <label className="block text-xl mb-2">
            Tiredness: {moodData.tiredness}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={moodData.tiredness}
            onChange={(e) => setMoodData({ ...moodData, tiredness: e.target.value })}
            className="w-full" />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Save Mood
        </button>
      </form>
    </div>
  );
}
