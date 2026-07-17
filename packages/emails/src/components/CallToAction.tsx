import { CallToActionIcon } from "./CallToActionIcon";

export const CallToAction = (props: {
  label: string;
  href?: string;
  secondary?: boolean;
  startIconName?: string;
  endIconName?: string;
}) => {
  const { label, href, secondary, startIconName, endIconName } = props;

  const calculatePadding = () => {
    const paddingTop = "0.625rem";
    const paddingBottom = "0.625rem";
    let paddingLeft = "1rem";
    let paddingRight = "1rem";

    if (startIconName) {
      paddingLeft = "0.875rem";
    } else if (endIconName) {
      paddingRight = "0.875rem";
    }

    return `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`;
  };

  const El = href ? "a" : "button";
  const restProps = href ? { href, target: "_blank" } : { type: "submit" };

  return (
    <p
      style={{
        display: "inline-block",
        // Slotix: primary CTA is a blue gradient (solid #5094f0 fallback for Outlook).
        backgroundColor: secondary ? "#FFFFFF" : "#5094f0",
        background: secondary ? "#FFFFFF" : "linear-gradient(135deg,#66A6FF,#5094F0)",
        border: secondary ? "1px solid #d1d5db" : "",
        color: "#ffffff",
        fontFamily: "Roboto, Helvetica, sans-serif",
        fontSize: "0.875rem",
        fontWeight: 600,
        lineHeight: "1rem",
        margin: 0,
        textDecoration: "none",
        textTransform: "none",
        padding: calculatePadding(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        msoPaddingAlt: "0px",
        borderRadius: "10px",
        boxSizing: "border-box",
        height: "2.25rem",
      }}>
      {/* @ts-expect-error shared props between href and button */}
      <El
        style={{
          color: secondary ? "#2f6fd0" : "#FFFFFF",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "auto",
          appearance: "none",
          background: "transparent",
          border: "none",
          padding: 0,
          fontSize: "inherit",
          fontWeight: 500,
          lineHeight: "1rem",
          cursor: "pointer",
        }}
        {...restProps}
        rel="noreferrer">
        {startIconName && (
          <CallToActionIcon
            style={{
              marginRight: "0.5rem",
              marginLeft: 0,
            }}
            iconName={startIconName}
          />
        )}
        {label}
        {endIconName && <CallToActionIcon iconName={endIconName} />}
      </El>
    </p>
  );
};
