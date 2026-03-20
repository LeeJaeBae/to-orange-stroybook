'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import DaumPostcode from 'react-daum-postcode';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { daumPostcodeTheme } from '@/lib/daum-postcode-theme';

interface AddressData {
  address: string;
  zonecode: string;
}

interface DaumPostcodeButtonProps {
  onComplete: (data: AddressData) => void;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function DaumPostcodeButton({
  onComplete,
  buttonText = '주소 검색',
  variant = 'outline',
  size = 'default',
  className = '',
}: DaumPostcodeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    onComplete({
      address: fullAddress,
      zonecode: data.zonecode,
    });

    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>주소 검색</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <DaumPostcode
              onComplete={handleComplete}
              autoClose={false}
              style={{ height: '450px' }}
              theme={daumPostcodeTheme}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
