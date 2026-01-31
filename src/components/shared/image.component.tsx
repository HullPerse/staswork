import { ImgHTMLAttributes, memo, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const ImageComponent = ({
  src,
  alt,
  className,
  width,
  height,
  ...props
}: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);

  const isExternal =
    src.startsWith("http") ||
    src.startsWith("blob:") ||
    src.startsWith("data:");

  const getWebpSrc = (originalSrc: string) => {
    if (isExternal || !originalSrc) return originalSrc;

    const baseSrc = originalSrc.split("?")[0];
    return `${baseSrc}`;
  };

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);


  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  if (hasError) {
    return (
      <div
        className={cn(
          "bg-background/40 border border-primary/20 flex items-center justify-center",
          className,
        )}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined,
        }}
      >
        <span className="text-4xl text-muted-foreground">Image</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden items-center flex w-full",
        className,
      )}
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    >
      <picture>
        <source srcSet={getWebpSrc(src)} type="image/webp" />
        <img
          ref={imgRef}
          src={src}
          alt={alt ?? ""}
          width={width}
          height={height}
          className={cn(
            isLoaded ? "opacity-100" : "opacity-0",
            isLoaded ? "opacity-transition" : "",
          )}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          {...props}
        />
      </picture>
    </div>
  );
};

export const Image = memo(ImageComponent);
