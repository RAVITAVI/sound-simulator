import { useState, useEffect, useRef } from 'react';

export default function SoundSimulator() {
  const [frequency, setFrequency] = useState(440);
  const [amplitude, setAmplitude] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [explanation, setExplanation] = useState('הסבר בסיסי');
  const [duration, setDuration] = useState(2); // Duration in seconds
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef(null);
  
  // Canvas settings
  const canvasWidth = 600;
  const canvasHeight = 200;
  const centerY = canvasHeight / 2;
  
  useEffect(() => {
    let audioContext = null;
    let oscillator = null;
    let gainNode = null;
    
    if (isPlaying) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      oscillator = audioContext.createOscillator();
      gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gainNode.gain.value = amplitude / 100;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      
      setRemainingTime(duration);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 0.1) {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }
    
    return () => {
      if (oscillator) {
        oscillator.stop();
        audioContext?.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, frequency, amplitude, duration]);
  
  const drawWave = () => {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    for (let x = 0; x < canvasWidth; x++) {
      const normalizedFreq = frequency / 440;
      const scaleFactor = 20;
      const y = centerY - Math.sin(x * normalizedFreq / scaleFactor) * (amplitude);
      ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();
  };
  
  useEffect(() => {
    const interval = setInterval(drawWave, 50);
    return () => clearInterval(interval);
  }, [frequency, amplitude]);
  
  useEffect(() => {
    if (frequency < 250) {
      setExplanation('קול נמוך (בס) - האוזן האנושית תופסת צלילים בתדר נמוך כבעלי גוון עמוק');
    } else if (frequency < 1000) {
      setExplanation('קול בינוני - התחום בו נמצאים רוב הצלילים במוזיקה והדיבור האנושי');
    } else {
      setExplanation('קול גבוה (טרבל) - צלילים גבוהים שהאוזן האנושית תופסת כחדים וצלולים');
    }
  }, [frequency]);

  const formatTime = (timeInSeconds) => {
    const seconds = Math.floor(timeInSeconds);
    const milliseconds = Math.floor((timeInSeconds - seconds) * 10);
    return `${seconds}.${milliseconds}s`;
  };
  
  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-right w-full">סימולטור קול - Sound Wave Simulator</h2>
      
      <div className="w-full mb-6">
        <canvas 
          id="waveCanvas" 
          width={canvasWidth} 
          height={canvasHeight}
          className="bg-white border border-gray-200 rounded-lg"
        />
      </div>
      
      <div className="w-full space-y-4">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <span>תדירות (Hz): {frequency}</span>
            <span>תדירות גבוהה = צליל גבוה</span>
          </div>
          <input 
            type="range" 
            min="80" 
            max="2000" 
            value={frequency} 
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="flex flex-col">
          <div className="flex justify-between">
            <span>עוצמה: {amplitude}%</span>
            <span>עוצמה גבוהה = צליל חזק</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={amplitude} 
            onChange={(e) => setAmplitude(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="flex flex-col">
          <div className="flex justify-between">
            <span>משך זמן (שניות): {duration}</span>
            <span>משך הצליל לפני עצירה אוטומטית</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="10" 
            step="0.5"
            value={duration} 
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="flex flex-row justify-between gap-4">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={\`flex-1 py-2 rounded-lg font-bold \${isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}\`}
          >
            {isPlaying ? 'הפסק צליל' : 'השמע צליל'}
          </button>
          
          {isPlaying && (
            <div className="flex-1 bg-blue-100 rounded-lg p-2 flex items-center justify-center">
              <div className="text-center">
                <span className="font-bold text-blue-800">נותרו: {formatTime(remainingTime)}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4 text-right">
          <h3 className="font-bold mb-2">הסבר:</h3>
          <p>{explanation}</p>
        </div>
        
        <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg mt-2 text-right">
          <h3 className="font-bold mb-2">מה הוא קול?</h3>
          <p>קול הוא גל של שינויי לחץ באוויר המתפשט מהמקור לאוזן. התדירות (בהרץ - Hz) קובעת את גובה הצליל, והאמפליטודה (גובה הגל) קובעת את עוצמת הצליל. האוזן האנושית יכולה לשמוע תדירויות בטווח שבין 20Hz ל-20,000Hz.</p>
          <p className="mt-2">משך הצליל הוא הזמן שבו הצליל נמשך. הצליל יכול להיות קצר (staccato) או ארוך (legato) בהתאם למשך הזמן שנבחר.</p>
        </div>
      </div>
    </div>
  );
}
