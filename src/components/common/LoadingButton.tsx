import { useState } from "react";
import { LoadingButtonProps } from "../../types";

/**
 * 加载按钮组件
 * 带加载状态的通用按钮
 */
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  loading: externalLoading,
  disabled,
  children,
  className = "card",
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || internalLoading || externalLoading) return;

    const result = onClick();
    if (result instanceof Promise) {
      setInternalLoading(true);
      try {
        await result;
      } finally {
        setInternalLoading(false);
      }
    }
  };

  const isLoading = externalLoading || internalLoading;

  return (
    <button
      className={className}
      onClick={handleClick}
      disabled={disabled || isLoading}
      style={{ opacity: isLoading ? 0.6 : 1 }}
    >
      {isLoading ? "处理中..." : children}
    </button>
  );
};

