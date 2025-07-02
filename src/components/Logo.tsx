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
    <img
      src={`/assets/logo/png/quickurl_icon_nobg.png`}
      alt="Logo"
      width={size}
      height={size}
      style={{ display: "inline-block" }}
    />
  );
}