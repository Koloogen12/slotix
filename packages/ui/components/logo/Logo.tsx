import classNames from "@calcom/ui/classNames";

export function Logo({
  small,
  icon,
  inline = true,
  className,
  src = "/slotix/slotix-logo.png",
}: {
  small?: boolean;
  icon?: boolean;
  inline?: boolean;
  className?: string;
  src?: string;
}) {
  return (
    <h3 className={classNames("logo", inline && "inline", className)}>
      <strong>
        {icon ? (
          <img className="mx-auto w-9" alt="Slotix" title="Slotix" src="/slotix/slotix-icon.png" />
        ) : (
          <img
            className={classNames(small ? "h-4 w-auto" : "h-6 w-auto")}
            alt="Slotix"
            title="Slotix"
            src={src}
          />
        )}
      </strong>
    </h3>
  );
}
