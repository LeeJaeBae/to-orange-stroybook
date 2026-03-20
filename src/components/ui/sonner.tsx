import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:border-orange-100 group-[.toaster]:bg-white/90 group-[.toaster]:text-slate-900 group-[.toaster]:backdrop-blur-md group-[.toaster]:shadow-[0_18px_50px_-24px_rgba(234,88,12,0.45)] data-[type=success]:border-emerald-200 data-[type=success]:bg-emerald-50/80 data-[type=success]:text-emerald-900 data-[type=error]:border-rose-200 data-[type=error]:bg-rose-50/80 data-[type=error]:text-rose-900 data-[type=info]:border-orange-200 data-[type=info]:bg-orange-50/80 data-[type=info]:text-orange-900 data-[type=warning]:border-amber-200 data-[type=warning]:bg-amber-50/80 data-[type=warning]:text-amber-900",
          title: "group-[.toast]:text-slate-900 group-[.toast]:font-semibold",
          description: "group-[.toast]:text-slate-600",
          actionButton:
            "group-[.toast]:bg-orange-500 group-[.toast]:text-white group-[.toast]:shadow-[0_8px_20px_-10px_rgba(249,115,22,0.6)]",
          cancelButton:
            "group-[.toast]:bg-orange-50 group-[.toast]:text-orange-700",
          closeButton:
            "group-[.toast]:text-slate-400 group-[.toast]:hover:text-slate-700",
          success: "!bg-emerald-50/80 !border-emerald-200 !text-emerald-900",
          error: "!bg-rose-50/80 !border-rose-200 !text-rose-900",
          info: "!bg-orange-50/80 !border-orange-200 !text-orange-900",
          warning: "!bg-amber-50/80 !border-amber-200 !text-amber-900",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
