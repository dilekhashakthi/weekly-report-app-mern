import React from 'react';
import { FiPlus, FiTrash2, FiFlag } from 'react-icons/fi';

const FlaggedList = ({ items = [], onChange, readOnly, addLabel, keyLabel, emptyText }) => {
  const update = (targetIndex, field, value) => {
    let next = items.map((item, index) => (index === targetIndex ? { ...item, [field]: value } : item));
    if (field === 'isKey' && value) {
      // only one item can be flagged as "key" at a time
      next = next.map((item, index) => (index === targetIndex ? item : { ...item, isKey: false }));
    }
    onChange(next);
  };

  const remove = (targetIndex) => {
    onChange(items.filter((_, index) => index !== targetIndex));
  };

  const add = () => {
    onChange([...items, { text: '', isKey: items.length === 0 }]);
  };

  if (readOnly) {
    if (!items.length) return <p className="text-sm text-ink/50">{emptyText}</p>;
    return (
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className={`flex items-start gap-2.5 rounded-md border px-3 py-2 text-sm ${
              item.isKey ? 'border-accent/40 bg-accent-light/60' : 'border-line'
            }`}
          >
            {item.isKey && (
              <span className="mt-0.5 inline-flex items-center gap-1 shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                <FiFlag className="h-3 w-3" />
                <span>{keyLabel}</span>
              </span>
            )}
            <span className="text-ink/80">{item.text}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <input
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            placeholder="Describe it..."
            value={item.text}
            onChange={(event) => update(index, 'text', event.target.value)}
          />
          <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-line px-2.5 py-2 text-xs text-ink/70 hover:bg-paper">
            <input
              type="checkbox"
              className="accent-accent"
              checked={item.isKey}
              onChange={(event) => update(index, 'isKey', event.target.checked)}
            />
            <span>{keyLabel}</span>
          </label>
          <button
            type="button"
            onClick={() => remove(index)}
            className="inline-flex items-center justify-center p-2.5 text-xs shrink-0 rounded-md bg-white text-red-700 border border-red-200 hover:bg-red-50 transition-colors"
            title="Remove item"
            aria-label="Remove item"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 text-xs rounded-md px-4 py-2 font-medium bg-white text-ink border border-line hover:bg-paper transition-colors"
      >
        <FiPlus className="h-3.5 w-3.5" />
        <span>{addLabel}</span>
      </button>
    </div>
  );
};

export default FlaggedList;
