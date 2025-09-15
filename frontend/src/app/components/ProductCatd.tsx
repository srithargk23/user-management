"use client";

interface ProductRowProps {
  _id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  category?: { _id: string; name: string }; 
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function ProductRow({
  _id,
  name,
  price,
  description,
  image,
  category,
  onDelete,
  onEdit,
}: ProductRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50">
      
      <td className="px-4 py-2">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-12 w-12 rounded object-cover"
          />
        ) : (
          <span className="text-gray-400 italic">No Image</span>
        )}
      </td>

     
      <td className="px-4 py-2 font-medium">{name}</td>

     
      <td className="px-4 py-2">${price}</td>

      
      <td className="px-4 py-2">
        {category?.name || <span className="text-gray-400 italic">Unassigned</span>}
      </td>

      
      <td className="px-4 py-2 text-sm text-gray-600">{description}</td>

      
      <td className="px-4 py-2 flex gap-2">
        <button
          onClick={() => onEdit(_id)}
          className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
        >
          E
        </button>
        <button
          onClick={() => onDelete(_id)}
          className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
        >
          D
        </button>
      </td>
    </tr>
  );
}
