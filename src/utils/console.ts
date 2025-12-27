/**
 * UI Console 工具函数
 * 用于在页面上显示日志信息
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export const uiConsole = (...args: any[]): void => {
  const el = document.querySelector("#console>p");
  if (el) {
    el.textContent = args
      .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg, null, 2)))
      .join("\n");
  }
  console.log(...args);
};
