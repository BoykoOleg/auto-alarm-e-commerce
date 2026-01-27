import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CatalogSectionProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Category[];
  filteredProducts: Product[];
}

export const CatalogSection = ({
  selectedCategory,
  setSelectedCategory,
  categories,
  filteredProducts,
}: CatalogSectionProps) => {
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Каталог товаров
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Широкий ассортимент сигнализаций и дополнительного оборудования
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className="gap-2"
            >
              <Icon name={cat.icon} className="h-4 w-4" />
              {cat.name}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                {product.popular && (
                  <Badge
                    variant="secondary"
                    className="bg-accent/10 text-accent mb-2 w-fit"
                  >
                    Хит продаж
                  </Badge>
                )}
                <CardTitle className="font-heading">
                  {product.name}
                </CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="outline"
                      className="text-xs"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
                <p className="text-2xl font-bold text-primary">
                  {product.price}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button className="flex-1 group-hover:bg-primary/90">
                  <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />В
                  корзину
                </Button>
                <Button variant="outline" size="icon">
                  <Icon name="Heart" className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
