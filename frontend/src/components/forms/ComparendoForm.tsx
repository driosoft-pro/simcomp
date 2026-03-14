function ComparendoForm() {
  return (
    <form className="space-y-4">
      <input type="date" className="w-full border p-2 rounded-lg"/>

      <input type="number" placeholder="Persona ID" className="w-full border p-2 rounded-lg"/>

      <input type="number" placeholder="Vehículo ID" className="w-full border p-2 rounded-lg"/>

      <input type="number" placeholder="Infracción ID" className="w-full border p-2 rounded-lg"/>

      <textarea
        placeholder="Observación"
        className="w-full border p-2 rounded-lg"
      />
    </form>
  )
}

export default ComparendoForm