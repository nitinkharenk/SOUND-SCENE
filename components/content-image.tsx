import Image from "next/image";

type ContentImageProps = {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
};

export function ContentImage({
  src,
  alt,
  sizes,
  className = "",
}: ContentImageProps) {
  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading="lazy"
      decoding="async"
      placeholder="empty"
      className={className}
    />
  );
}
