import { useState } from "react";

export default function AlertList({ title = "Alert", iconSrc = null, items = [] }) {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpand = (id) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(id)) {
      newExpandedItems.delete(id);
    } else {
      newExpandedItems.add(id);
    }
    setExpandedItems(newExpandedItems);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-center mb-3 gap-2">
        {iconSrc && <img src={iconSrc} alt="Alert" className="w-6 h-6 rounded-full" />}
        <h3
          className=" font-semibold text-[#1E40AF] text-center"
        >
          {title}
        </h3>
      </div>

      <div className="h-0.5 w-full mb-3" style={{ backgroundColor: "#07518D" }} />

      {/* List */}
      <div className="space-y-0.5 max-h-[30vh] md:max-h-[10vh] 2xl:min-h-[16vh] 3xl:min-h-[20vh] overflow-y-auto custom-scrollbar pr-2 pb-2">
        {items.length === 0 ? (
          <div className="text-center py-4 text-[#64748B] text-sm">
            🎉 All devices are operating normally.
          </div>
        ) : (
          items.map((item) => {
            const hasNested = Array.isArray(item.nestedItems) && item.nestedItems.length > 0;
            const isExpanded = expandedItems.has(item.id);

            return (
              <div key={item.id}>
                <div
                  className="flex items-center justify-between py-1.5 cursor-pointer"
                  onClick={() => toggleExpand(item.id)}
                  role="button"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center">
                    {hasNested ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(item.id);
                        }}
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                        className=" cursor-pointer  mr-2 p-0 border-0 bg-transparent inline-flex items-center justify-center"
                      >
                        <img
                          src="/dropdownClosedIcon.png"
                          className={`h-5 w-5 transform transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                          alt=""
                        />
                      </button>
                    ) : (
                      <span className="w-5 h-4 inline-block mr-2" />
                    )}

                    <span className="text-[#1E293B] font-medium text-sm">{item.name}</span>
                  </div>

                  <div className="icon-number-align">
                    <img src="/alert-icon.png" alt="Alert" className="w-4 h-4 mr-1" />
                    <span className="text-[#1E293B] text-sm font-medium">{item.devices}</span>
                  </div>
                </div>

                {isExpanded && hasNested && (
                  <div className="pl-6 space-y-1 mt-1">
                    {item.nestedItems.map((nestedItem) => (
                      <div key={nestedItem.id} className="flex items-center justify-between py-0.5">
                        <div className="flex items-center">
                          <img src="/alert-icon.png" alt="Alert" className="w-4 h-4 mr-2" />
                          <span className="text-[#1E293B] text-sm font-medium">{nestedItem.name}</span>
                        </div>
                        {nestedItem.date && (
                          <span className="text-[#64748B] text-sm">{nestedItem.date}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
