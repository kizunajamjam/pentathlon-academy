import { startTransition, type FormEvent } from "react";

/*
 * 送っても入力内容が消えないフォームにするための onSubmit。
 *
 * React 19 では <form action={...}> で送ると、処理のあとフォームが自動で
 * 初期化される。入力エラーで差し戻したときにも、書いた内容が全部消えてしまう
 * （お問い合わせ本文や、管理画面で編集中の項目など）。
 *
 * action はそのまま残し、この onSubmit を足して使う:
 *   <form action={formAction} onSubmit={keepInputsOnSubmit(formAction)}>
 *
 * - 画面の準備ができてからの送信は、ここで既定の動作を止めて自分でアクションを
 *   呼ぶ。同じ処理の中で呼べば React はそれを送信中として扱うので、
 *   useFormStatus の「送信中」表示は効いたまま、初期化だけが起きない。
 * - 画面の準備ができる前（読み込み途中）の送信は onSubmit が動かないので、
 *   action によるふつうの POST で送られる。action を外すと GET で送られ、
 *   入力内容（パスワードや個人情報）が URL に載ってしまう。
 *
 * beforeSend で送信直前に値を足せる（流入元など）。
 */
export function keepInputsOnSubmit(
  action: (formData: FormData) => void,
  beforeSend?: (formData: FormData) => void,
) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(e.currentTarget, submitter ?? undefined);
    beforeSend?.(formData);
    startTransition(() => action(formData));
  };
}
