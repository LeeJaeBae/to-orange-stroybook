import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/fetch';
import type { WeatherData } from '../types';

export function useLetterWeather(recipientAddress?: string, recipientFacility?: string) {
  const [recipientWeather, setRecipientWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (recipientAddress || recipientFacility) {
          const address = recipientAddress || recipientFacility || '';
          const cityMatch = address.match(
            /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/
          );
          const city = cityMatch ? cityMatch[1] : 'Seoul';

          const recipientResponse = await apiFetch(`/api/v1/weather?location=${city}`);
          if (recipientResponse.ok) {
            const recipientData = await recipientResponse.json();
            setRecipientWeather(recipientData.data);
          }
        }
      } catch (error) {
        console.error('날씨 데이터 로드 실패:', error);
      }
    };

    fetchWeather();
  }, [recipientAddress, recipientFacility]);

  return recipientWeather;
}
