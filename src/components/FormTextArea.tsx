interface FormTextAreaProps {
  label: string
  id: string
  name: string
  value: string | undefined | null
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  rows?: number
  className?: string
}

export default function FormTextArea({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3,
  className = ''
}: FormTextAreaProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        value={value || ''}
        onChange={onChange}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        required={required}
      />
    </div>
  )
}
