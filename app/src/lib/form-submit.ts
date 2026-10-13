import { startTransition, type FormEvent } from "react";

/*
 * フォームを送っても入力内容を消さない送信ハンドラ。
 *
 * React 19 では <form action={...}> で送ると、処理が終わったあとフォームが
 * 自動で初期化される。入力エラーで差し戻したときにも、書いた内容が全部消えて
 * しまう（お問い合わせ本文や、管理画面で編集した項目など）。
 * onSubmit で受けて自分でアクションを呼べば、この自動の初期化は起きない。
 *
 * 使い方: <form onSubmit={submitWithoutReset(formAction)}>
 * beforeSend で送信直前に値を足せる（流入元など）。
 */
export function submitWithoutReset(
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
