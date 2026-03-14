function PersonaForm() {
  return (
    <form className="space-y-4">
      <input
        type="text"
        placeholder="Nombre"
        className="w-full rounded-lg border p-2"
      />

      <input
        type="text"
        placeholder="Documento"
        className="w-full rounded-lg border p-2"
      />
    </form>
  )
}

export default PersonaForm