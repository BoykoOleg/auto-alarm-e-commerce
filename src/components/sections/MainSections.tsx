import { CatalogSection } from "./CatalogSection";
import { RussificationSection } from "./RussificationSection";
import { StaticServicesSection } from "./StaticServicesSection";
import { AboutSection } from "./AboutSection";
import { ContactsSection } from "./ContactsSection";

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

interface Service {
  title: string;
  description: string;
  price: string;
  icon: string;
}

interface MainSectionsProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCarBrand: string;
  setSelectedCarBrand: (brand: string) => void;
  selectedService: string;
  setSelectedService: (service: string) => void;
  formData: {
    name: string;
    phone: string;
    car: string;
    message: string;
  };
  setFormData: (data: any) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  submitStatus: "idle" | "success" | "error";
  setSubmitStatus: (status: "idle" | "success" | "error") => void;
  categories: Category[];
  filteredProducts: Product[];
  services: Service[];
}

export const MainSections = ({
  activeSection,
  setActiveSection,
  selectedCategory,
  setSelectedCategory,
  setSelectedCarBrand,
  isSubmitting,
  setIsSubmitting,
  submitStatus,
  setSubmitStatus,
  categories,
  filteredProducts,
  services,
}: MainSectionsProps) => {
  return (
    <>
      {activeSection === "catalog" && (
        <CatalogSection
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          filteredProducts={filteredProducts}
        />
      )}

      {activeSection === "russification" && (
        <RussificationSection
          setSelectedCarBrand={setSelectedCarBrand}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          submitStatus={submitStatus}
          setSubmitStatus={setSubmitStatus}
        />
      )}

      {activeSection === "services" && (
        <StaticServicesSection
          services={services}
          setActiveSection={setActiveSection}
        />
      )}

      {activeSection === "about" && <AboutSection />}

      {activeSection === "contacts" && (
        <ContactsSection
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          submitStatus={submitStatus}
          setSubmitStatus={setSubmitStatus}
        />
      )}
    </>
  );
};
