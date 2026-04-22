import { Link } from 'react-router-dom';
import { Category } from '@/hooks/useProducts';
import {
  Smartphone,
  Shirt,
  Home,
  Heart,
  Dumbbell,
  BookOpen,
  Coffee,
  Car,
  Grid3X3
} from 'lucide-react';

interface CategoryIconProps {
  category: Category;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Shirt,
  Home,
  Heart,
  Dumbbell,
  BookOpen,
  Coffee,
  Car
};

const CategoryIcon = ({ category }: CategoryIconProps) => {
  const Icon = category.icon ? iconMap[category.icon] || Grid3X3 : Grid3X3;

  return (
    <Link
      to={`/products?category=${category.id}`}
      className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors group"
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
        <Icon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
        {category.name}
      </span>
    </Link>
  );
};

export default CategoryIcon;
