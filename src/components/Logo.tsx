import Image from "next/image";

type LogoProps = {
  type?: "dark" | "light";
  bg?: boolean;
  size?: number;
};

export function Logo({
  type = "dark",
  bg = false,
  size = 24,
}: LogoProps) {
  return (
    <Image 
      src={`/assets/logo/png/quickurl_icon_${type == "dark" ? "" : "dark_"}${bg ? "bg" : "nobg"}.png`}
      alt="Logo"
      width={size}
      height={size}
      style={{ display: "inline-block" }}
    />
  );
}