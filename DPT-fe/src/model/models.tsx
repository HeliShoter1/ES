export type Customer = {
    id: number;
    full_name: string;
    phone: string;
    email: string;
    address: string;
    };

export type Employee = {
    id: number;
    full_name: string;
    phone: string;
    email: string;
    address: string;
    role: string;
    is_active?: boolean;
};

type ImportItem = {
    id: number;
    import_id: number;
    product_id: number;
    quantity: number;
    unit_cost: number;
  };

  type Order = {
    id: number;
    customer:Customer;
    total_amount?: number;
    employee?: Employee;
    status: string;
    create_at: string;
    // nếu có các field khác thì khai báo thêm ở đây
  };
  
  type OrderUpdate = {
    id: number;
    customer_id?:number;
    total_amount?: number;
    employee_id?: number;
    status: string;
    create_at: string;
}

  interface ProductImage {
    id: number;
    image_path: string;
    product_id: number;
  }
type Supplier = { id: number; name: string; };

  
  type Product = {
    id: number;
    name: string;
    description?: string;
    sell_price?: number;
    stock_quantity?: number;
    warranty_months?: number;
    category?: { name: string };
    supplier?: Supplier
    product_image?: ProductImage[];
  };
  
  type CartProduct = {
    product: Product;
    number: number;
  };
  
  type Cart = {
    customer: number;
    products: CartProduct[];
  };  

  export type Category = {
    id: number;
    name: string;
    description?: string | null;
  };
  interface ProductImage {
    id: number;
    image_path: string;
    product_id: number;
  }