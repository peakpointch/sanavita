import { AlertDialog } from "peakflow/modal";

export function getAlertDialog(): AlertDialog {
  const modalElement = AlertDialog.select('component', 'alert-dialog');
  const modal = new AlertDialog(modalElement, {
    animation: {
      type: 'growIn',
      duration: 200,
    },
    bodyScroll: {
      lock: true,
      smooth: true,
    },
  });

  return modal;
}
