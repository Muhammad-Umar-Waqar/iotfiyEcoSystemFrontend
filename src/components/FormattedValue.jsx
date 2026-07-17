export default function FormattedValue({ value, unit }) {
    if (value == null || value === "--") {
      return <strong>--</strong>;
    }
  
    const [whole, decimal = ""] = String(value).split(".");
  
    return (
      <strong className="flex items-end">
        <div className="text-3xl leading-none">{whole}</div>
  
        {decimal && (
          <span className="text-md leading-none">
            .{decimal}
          </span>
        )}
  
        {unit && (
          <span className="text-lg leading-none ml-1 font-medium">
            {unit}
          </span>
        )}
      </strong>
    );
  };
