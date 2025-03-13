import { useState, useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface WebcamCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
}

export function WebcamCapture({ isOpen, onClose, onCapture }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCaptureEnabled, setIsCaptureEnabled] = useState(true);
  
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
        onClose();
      }
    }
  }, [webcamRef, onCapture, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Take a profile photo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4">
          {isCaptureEnabled ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="w-full rounded-md overflow-hidden"
              onUserMediaError={() => setIsCaptureEnabled(false)}
            />
          ) : (
            <div className="p-8 text-center bg-muted rounded-md">
              <p>Unable to access camera.</p>
              <p className="text-sm text-muted-foreground mt-2">Please check your browser permissions.</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={capture} disabled={!isCaptureEnabled}>Capture Photo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
