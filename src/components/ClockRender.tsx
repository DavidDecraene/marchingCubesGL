import { useState, ReactElement, useEffect } from 'react';
import { GameManager } from '../lib/world/GameManager';



export function ClockRender(): ReactElement {
  const [hours, setHour ] = useState(0);
  const [minutes, setMinute ] = useState(0);
  const sHour = (hours+'').padStart(2, '0');
  const sMinute = (minutes+'').padStart(2, '0');


  useEffect(() => {
    const sub = GameManager.onMediumTick.subscribe(() => {
      const { hour, minute } = GameManager.clock.data;
      if (minutes === minute) return;
      setHour(hour);
      setMinute(minute);
    });
    return () => {
      sub?.unsubscribe();
    }
  }, []);

  return <div>
    <label>TimeOfDay:</label>
    <span className="ml5">{sHour}:{sMinute}</span>
  </div>;
}
