import { Copy } from "@geist-ui/icons";
import { useToasts, useClipboard, Button } from "@geist-ui/core";
export default function CopyButton() {
  const { setToast } = useToasts();
  const { copy } = useClipboard();
  const handler = () => {
    copy("hello, geist-ui");
    setToast({ text: "Text copied." });
  };
  return (
    <>
      <Button scale={0.5} auto onClick={handler}>
        <Copy />
      </Button>
    </>
  );
}
