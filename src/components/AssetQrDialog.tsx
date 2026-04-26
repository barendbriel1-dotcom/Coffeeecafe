import { useEffect, useState } from "react";
import { Download, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buildAssetQrFilename, downloadAssetQrPng, generateAssetQrDataUrl, type AssetQrLabel } from "@/lib/qr";

interface AssetQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: AssetQrLabel | null;
}

export default function AssetQrDialog({ open, onOpenChange, asset }: AssetQrDialogProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;

    if (!open || !asset) {
      setQrDataUrl(null);
      return;
    }

    setLoading(true);
    generateAssetQrDataUrl(asset.assetId)
      .then((nextUrl) => {
        if (active) {
          setQrDataUrl(nextUrl);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [asset, open]);

  const handleDownload = async () => {
    if (!asset) return;
    setDownloading(true);
    try {
      await downloadAssetQrPng(asset);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-primary/20 bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Asset QR Code</DialogTitle>
        </DialogHeader>

        {asset && (
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-primary/14 bg-secondary/80 p-4 text-center">
              <div className="font-display text-xl text-foreground glow-soft">{asset.name}</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-primary/70">{asset.code}</div>
              {asset.serialNumber && (
                <div className="mt-1 text-xs text-muted-foreground">{asset.serialNumber}</div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-primary/18 bg-background px-4 py-5">
              {loading ? (
                <div className="flex min-h-[320px] items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-primary/60">
                  Generating QR…
                </div>
              ) : qrDataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={qrDataUrl} alt={`QR code for ${asset.name}`} className="h-72 w-72 rounded-[1.2rem] border border-primary/15 bg-background object-contain p-3" />
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {buildAssetQrFilename(asset, "png")}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[320px] items-center justify-center gap-2 text-sm text-muted-foreground">
                  <QrCode size={18} />
                  QR preview unavailable.
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleDownload} disabled={!asset || !qrDataUrl || downloading}>
            <Download size={14} className="mr-2" />
            {downloading ? "Downloading…" : "Download PNG"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
