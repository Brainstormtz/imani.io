interface Props {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function Feature({ title, description, icon }: Props) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#FF4E64] bg-opacity-10 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
