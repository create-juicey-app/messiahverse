import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import MoodGraph from '@/components/MoodGraph';
import WeatherDisplay from '@/components/WeatherDisplay';

export default function MoodPage() {
  const [moodData, setMoodData] = useState(null);
  const [parisTime12, setParisTime12] = useState('');
  const [parisTime24, setParisTime24] = useState('');
  const [timeEmoji, setTimeEmoji] = useState('🌞');
  const [canEdit, setCanEdit] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const { data: session } = useSession();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moodRes, authRes, historyRes] = await Promise.all([
          fetch('/api/mood', { credentials: 'include' }),
          fetch('/api/mood/auth', { credentials: 'include' }),
          fetch('/api/mood/history', { credentials: 'include' })
        ]);
        const mood = await moodRes.json();
        const auth = await authRes.json();
        const history = await historyRes.json();
        setMoodData(mood);
        setCanEdit(auth.canEdit);
        setMoodHistory(history);
      } finally {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500); // Minimum loading time
      }
    };

    fetchData();
    const interval = setInterval(() => fetchData(), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateParisTime = () => {
      const time12 = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Paris',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      const time24 = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Paris',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const hour = new Date().getHours();
      setTimeEmoji(hour >= 6 && hour < 18 ? '☀️' : '🌙');
      setParisTime12(time12);
      setParisTime24(time24);
    };

    updateParisTime();
    const interval = setInterval(updateParisTime, 60000);
    return () => clearInterval(interval);
  }, []);

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
    
    // Special case for corner cells - make them slightly more transparent to make text readable
    const isCorner = index === 0 || index === 5 || index === 30 || index === 35;
    const opacity = isCorner ? 0.5 : (index === moodData?.gridPosition ? '1' : '0.7');
    
    return {
      background: `rgb(${r}, ${g}, ${b})`,
      opacity,
      border: index === moodData?.gridPosition ? '3px solid white' : 'none',
      boxShadow: index === moodData?.gridPosition ? '0 0 10px rgba(0,0,0,0.5)' : 'none'
    };
  };

  if (!moodData) {
    return (
      <div className="max-w-6xl mx-auto p-6 dark:text-white animate-pulse">
        <div className="flex justify-between items-start gap-8">
          <div className="flex-1">
            {/* Skeleton for header */}
            <div className="flex justify-between items-center mb-8">
              <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            
            {/* Skeleton for mood grid */}
            <div className="mb-8">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="w-96 h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Skeleton for bars */}
            <div className="space-y-6">
              <div>
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div>
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {/* Skeleton for weather */}
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            {/* Skeleton for graph */}
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 dark:text-white">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="w-full lg:flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Juicey's Current Mood</h1>
            <div className="text-lg sm:text-xl font-medium flex flex-col items-end">
              <div>{timeEmoji} {parisTime12}</div>
              <div className="text-xs sm:text-sm text-gray-500">-{parisTime24} Paris-</div>
            </div>
          </div>
          
          <div className="mb-8 relative">
            <h2 className="text-xl mb-4">Mood Grid</h2>
            <div className="grid grid-cols-6 gap-1 w-full max-w-[24rem] aspect-square mx-auto bg-gray-100 dark:bg-gray-800 relative">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  style={getCellBackground(i)}
                  className="transition-all duration-200 border border-gray-200 dark:border-gray-700 relative"
                >
                  {/* Updated corner labels with text stroke effect */}
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
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl mb-2">Mental Wellness</h2>
              <div className="w-full h-4 bg-gray-200 rounded">
                <div
                  className="h-full bg-green-500 rounded"
                  style={{ width: `${moodData.mentalWellness}%` }}
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl mb-2">Tiredness</h2>
              <div className="w-full h-4 bg-gray-200 rounded">
                <div
                  className="h-full bg-red-500 rounded"
                  style={{ width: `${moodData.tiredness}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full mt-4 px-4 py-2 bg-surface hover:bg-surface-hover 
                         border border-border rounded-lg flex items-center justify-between"
            >
              <span className="font-medium">Additional Details</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDetailsOpen && (
              <div className="p-4 bg-surface rounded-lg border border-border space-y-4 animate-slideDown">
                <div>
                  <h3 className="font-medium mb-2">Last Updated</h3>
                  <p>{new Date(moodData.updatedAt).toLocaleString()}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Mood Position Analysis</h3>
                  <p>Grid Position: {moodData.gridPosition}</p>
                  <p>Row: {Math.floor(moodData.gridPosition / 6)}</p>
                  <p>Column: {moodData.gridPosition % 6}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Statistics</h3>
                  <p>Updates today: {moodHistory.filter(m => new Date(m.timestamp).toDateString() === new Date().toDateString()).length}</p>
                  <p>Average Mental Wellness: {Math.round(
                    moodHistory.reduce((acc, curr) => acc + curr.mentalWellness, 0) / moodHistory.length
                  )}%</p>
                  <p>Average Tiredness: {Math.round(
                    moodHistory.reduce((acc, curr) => acc + curr.tiredness, 0) / moodHistory.length
                  )}%</p>
                </div>
              </div>
            )}

            {canEdit && (
              <div className="mt-4">
                <a href="/juicey/edit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Update Mood
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:flex-1">
          <WeatherDisplay />
          <h2 className="text-xl mb-4 mt-8">Mental Wellness History</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg h-[300px] sm:h-[400px]">
            <MoodGraph history={moodHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
