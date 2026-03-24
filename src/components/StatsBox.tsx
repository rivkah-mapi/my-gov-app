interface StatBoxProps {
  title: string;
  value: string;
}

const StatBox: React.FC<StatBoxProps> = ({ title, value }) => (
  <div className="border border-gray-600 p-2 rounded-sm flex flex-col items-center">
  <p className="text-xs text-black mb-2">{title}</p>
  <p className="text-xl font-semibold">{value}</p>
  </div>
);

export default StatBox;