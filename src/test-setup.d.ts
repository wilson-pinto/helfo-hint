import '@testing-library/jest-dom';

declare module '@testing-library/jest-dom' {
  export {};
}

declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any> {
      (...args: Y): T;
      mockClear(): void;
      mockReset(): void;
      mockImplementation(fn: (...args: Y) => T): Mock<T, Y>;
      mockResolvedValue(value: T): Mock<Promise<T>, Y>;
      mockRejectedValue(value: any): Mock<Promise<T>, Y>;
    }

    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeVisible(): R;
      toHaveClass(className: string): R;
      toHaveStyle(style: Record<string, any>): R;
      toBeDisabled(): R;
      toHaveValue(value: string | number | string[]): R;
    }

    const fn: {
      <T = any>(): Mock<T>;
      <T = any>(implementation: (...args: any[]) => T): Mock<T>;
    };
    const mock: (moduleName: string, factory?: any) => void;
    const clearAllMocks: () => void;
  }
}

declare module 'framer-motion' {
  export type MotionComponentType = React.ComponentType<any> & {
    [K in keyof JSX.IntrinsicElements]: React.ComponentType<any>;
  };

  export const motion: MotionComponentType;
  export const AnimatePresence: React.FC<{
    mode?: 'sync' | 'popLayout' | 'wait';
    initial?: boolean;
    onExitComplete?: () => void;
    children?: React.ReactNode;
  }>;
  export type Transition = any;
  export type Variants = any;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@/test-utils' {
  export * from '@testing-library/react';
  export { default as userEvent } from '@testing-library/user-event';
  export function renderWithProviders(
    ui: React.ReactElement,
    options?: any
  ): ReturnType<typeof import('@testing-library/react').render> & { store: any };
}