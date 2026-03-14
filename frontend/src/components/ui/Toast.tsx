interface Props {
  message: string
}

function Toast({ message }: Props) {
  return (
    <div className="fixed bottom-4 right-4 rounded-lg bg-slate-900 px-4 py-2 text-white shadow-lg">
      {message}
    </div>
  )
}

export default Toast