--
-- PostgreSQL database dump
--

\restrict 26hZlUvcndcyWtW0maOya3OCWFE9mCVN3L6vpXR0pkqM1fAPIN98xvj9dPkKF0K

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-12-08 00:09:14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 915 (class 1247 OID 16866)
-- Name: account_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.account_role AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public.account_role OWNER TO postgres;

--
-- TOC entry 882 (class 1247 OID 16678)
-- Name: employee_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_role AS ENUM (
    'admin',
    'staff',
    'manager'
);


ALTER TYPE public.employee_role OWNER TO postgres;

--
-- TOC entry 879 (class 1247 OID 16669)
-- Name: order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status AS ENUM (
    'paid',
    'unpaid',
    'pending',
    'cancelled',
    'successful'
);


ALTER TYPE public.order_status OWNER TO postgres;

--
-- TOC entry 248 (class 1255 OID 25588)
-- Name: delete_before_order_details_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_before_order_details_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE orders
    SET
        order_total_after = (
            SELECT SUM(order_detail_price_after * order_detail_quantity)
            FROM order_details
            WHERE order_id = OLD.order_id
        ),
        order_total_before = (
            SELECT SUM(order_detail_price_before * order_detail_quantity)
            FROM order_details
            WHERE order_id = OLD.order_id
        )
    WHERE order_id = OLD.order_id;

    RETURN OLD;
END;
$$;


ALTER FUNCTION public.delete_before_order_details_func() OWNER TO postgres;

--
-- TOC entry 247 (class 1255 OID 25574)
-- Name: insert_after_feedbacks_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_after_feedbacks_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE 
    avg_rate DECIMAL(10, 1);
    product_id INT;
BEGIN
    -- Lấy product_id từ product_variants theo product_variant_id được insert
    SELECT product_variants.product_id INTO product_id
    FROM product_variants
    WHERE product_variants.product_variant_id = NEW.product_variant_id;

    -- Tính trung bình rate của toàn bộ variant trong cùng 1 product
    SELECT AVG(feedbacks.feedback_rate) INTO avg_rate
    FROM feedbacks
    JOIN product_variants ON feedbacks.product_variant_id = product_variants.product_variant_id
    WHERE product_variants.product_id = product_id;

    -- Cập nhật vào bảng products
    UPDATE products
    SET product_rate = avg_rate
    WHERE products.product_id = product_id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.insert_after_feedbacks_func() OWNER TO postgres;

--
-- TOC entry 249 (class 1255 OID 25590)
-- Name: insert_before_order_details_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_before_order_details_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Giá trước giảm
    SELECT product_variant_price
    INTO NEW.order_detail_price_before
    FROM product_variants
    WHERE product_variant_id = NEW.product_variant_id;

    -- Giá sau giảm
    SELECT COALESCE(
        view_product_variants.product_variant_price * (1 - view_product_variants.discount_amount / 100),
        NEW.order_detail_price_before
    ) INTO NEW.order_detail_price_after
    FROM view_product_variants
    WHERE view_product_variants.product_variant_id = NEW.product_variant_id;

    UPDATE orders
    SET
        order_total_after = (
            SELECT SUM(order_detail_price_after * order_detail_quantity)
            FROM order_details
            WHERE order_id = NEW.order_id
        ),
        order_total_before = (
            SELECT SUM(order_detail_price_before * order_detail_quantity)
            FROM order_details
            WHERE order_id = NEW.order_id
        )
    WHERE order_id = NEW.order_id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.insert_before_order_details_func() OWNER TO postgres;

--
-- TOC entry 261 (class 1255 OID 25596)
-- Name: update_before_order_details_func(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_before_order_details_func() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    SELECT product_variant_price
    INTO NEW.order_detail_price_before
    FROM product_variants
    WHERE product_variant_id = NEW.product_variant_id;

    SELECT COALESCE(
        view_product_variants.product_variant_price * (1 - view_product_variants.discount_amount / 100),
        NEW.order_detail_price_before
    ) INTO NEW.order_detail_price_after
    FROM view_product_variants
    WHERE view_product_variants.product_variant_id = NEW.product_variant_id;

    UPDATE orders
    SET
        order_total_after = (
            SELECT SUM(order_detail_price_after * order_detail_quantity)
            FROM order_details
            WHERE order_id = NEW.order_id
        ),
        order_total_before = (
            SELECT SUM(order_detail_price_before * order_detail_quantity)
            FROM order_details
            WHERE order_id = NEW.order_id
        )
    WHERE order_id = NEW.order_id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_before_order_details_func() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 238 (class 1259 OID 16872)
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    role public.account_role DEFAULT 'user'::public.account_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16871)
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_id_seq OWNER TO postgres;

--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 237
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- TOC entry 240 (class 1259 OID 25547)
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin (
    admin_id integer NOT NULL,
    admin_login_name character varying(100) NOT NULL,
    admin_password character varying(100) NOT NULL,
    admin_name character varying(100) NOT NULL,
    admin_full_name character varying(100) NOT NULL,
    admin_avt_img character varying(100) DEFAULT NULL::character varying,
    admin_birth date NOT NULL,
    admin_sex smallint NOT NULL,
    admin_email character varying(100) NOT NULL,
    admin_phone character varying(10) NOT NULL,
    admin_address text,
    admin_role character varying(100) DEFAULT 'Owner'::character varying,
    admin_active smallint DEFAULT 1
);


ALTER TABLE public.admin OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16997)
-- Name: cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart (
    id_customer integer NOT NULL,
    id_product integer NOT NULL,
    number integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.cart OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16686)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16685)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 217
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 224 (class 1259 OID 16720)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    full_name character varying(100),
    phone character varying(15),
    email character varying(100),
    address character varying(200) NOT NULL,
    password_hash character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16719)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 223
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- TOC entry 241 (class 1259 OID 25556)
-- Name: discounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discounts (
    discount_id integer NOT NULL,
    discount_name character varying(100) NOT NULL,
    discount_description text,
    discount_start_date date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    discount_end_date date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    discount_amount double precision NOT NULL,
    discount_is_display smallint DEFAULT 1 NOT NULL,
    discount_img character varying(100) DEFAULT NULL::character varying
);


ALTER TABLE public.discounts OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16706)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    full_name character varying(100),
    phone character varying(15),
    email character varying(100),
    address character varying(200),
    role public.employee_role DEFAULT 'staff'::public.employee_role NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16705)
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 221
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- TOC entry 243 (class 1259 OID 25576)
-- Name: feedback_imgs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedback_imgs (
    feedback_img_id integer NOT NULL,
    feedback_id integer NOT NULL,
    feedback_img_name character varying(100) NOT NULL,
    feedback_img_is_display smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.feedback_imgs OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 25565)
-- Name: feedbacks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedbacks (
    feedback_id integer NOT NULL,
    product_variant_id integer NOT NULL,
    customer_id integer NOT NULL,
    order_id integer NOT NULL,
    feedback_date date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    feedback_rate integer DEFAULT 5 NOT NULL,
    feedback_content text DEFAULT 'Bạn chưa để lại lời nhận xét nào'::text,
    feedback_is_display smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.feedbacks OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16836)
-- Name: import_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.import_items (
    id integer NOT NULL,
    import_id integer,
    product_id integer,
    quantity integer NOT NULL,
    unit_cost numeric(15,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.import_items OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16835)
-- Name: import_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.import_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.import_items_id_seq OWNER TO postgres;

--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 235
-- Name: import_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.import_items_id_seq OWNED BY public.import_items.id;


--
-- TOC entry 232 (class 1259 OID 16796)
-- Name: imports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.imports (
    id integer NOT NULL,
    supplier_id integer,
    employee_id integer,
    import_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_cost numeric(15,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.imports OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16795)
-- Name: imports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.imports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.imports_id_seq OWNER TO postgres;

--
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 231
-- Name: imports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.imports_id_seq OWNED BY public.imports.id;


--
-- TOC entry 244 (class 1259 OID 25580)
-- Name: notification_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_types (
    notification_type_id integer NOT NULL,
    notification_type_name character varying(100) NOT NULL,
    notification_type_img character varying(100) NOT NULL
);


ALTER TABLE public.notification_types OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 25583)
-- Name: order_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_details (
    order_id integer NOT NULL,
    product_variant_id integer NOT NULL,
    order_detail_quantity integer NOT NULL,
    order_detail_price_before integer DEFAULT 0,
    order_detail_price_after integer DEFAULT 0
);


ALTER TABLE public.order_details OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16818)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    quantity integer NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16817)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 233
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 230 (class 1259 OID 16773)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    customer_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_amount numeric(15,2),
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16772)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 229
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 246 (class 1259 OID 25592)
-- Name: paying_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paying_methods (
    paying_method_id integer NOT NULL,
    paying_method_name character varying(100) NOT NULL,
    paying_method_is_display smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.paying_methods OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16756)
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer NOT NULL,
    image_path character varying(500) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16755)
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_images_id_seq OWNER TO postgres;

--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 227
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- TOC entry 226 (class 1259 OID 16733)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    category_id integer,
    supplier_id integer,
    description text,
    cost_price numeric(15,2),
    sell_price numeric(15,2),
    stock_quantity integer,
    warranty_months integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16732)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 225
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 220 (class 1259 OID 16697)
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    address character varying(200),
    phone character varying(15),
    email character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16696)
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO postgres;

--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 219
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- TOC entry 4869 (class 2604 OID 16875)
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- TOC entry 4837 (class 2604 OID 16689)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4848 (class 2604 OID 16723)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 4843 (class 2604 OID 16709)
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- TOC entry 4867 (class 2604 OID 16839)
-- Name: import_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_items ALTER COLUMN id SET DEFAULT nextval('public.import_items_id_seq'::regclass);


--
-- TOC entry 4861 (class 2604 OID 16799)
-- Name: imports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imports ALTER COLUMN id SET DEFAULT nextval('public.imports_id_seq'::regclass);


--
-- TOC entry 4865 (class 2604 OID 16821)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 4857 (class 2604 OID 16776)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4854 (class 2604 OID 16759)
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- TOC entry 4851 (class 2604 OID 16736)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4840 (class 2604 OID 16700)
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- TOC entry 5116 (class 0 OID 16872)
-- Dependencies: 238
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, customer_id, role, is_active, created_at, updated_at) FROM stdin;
1	1	user	t	2025-09-28 23:38:24.32582+07	2025-09-28 23:38:24.32582+07
2	2	user	t	2025-09-28 23:38:24.32582+07	2025-09-28 23:38:24.32582+07
3	3	admin	t	2025-09-28 23:38:24.32582+07	2025-09-28 23:38:24.32582+07
5	5	admin	t	2025-12-04 15:16:36.16527+07	2025-12-04 15:16:36.16527+07
\.


--
-- TOC entry 5118 (class 0 OID 25547)
-- Dependencies: 240
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin (admin_id, admin_login_name, admin_password, admin_name, admin_full_name, admin_avt_img, admin_birth, admin_sex, admin_email, admin_phone, admin_address, admin_role, admin_active) FROM stdin;
\.


--
-- TOC entry 5117 (class 0 OID 16997)
-- Dependencies: 239
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart (id_customer, id_product, number) FROM stdin;
1	2	1
1	4	2
2	1	1
3	3	1
1	1	2
5	5	1
5	6	1
5	4	1
5	3	1
5	2	1
5	1	1
5	8	1
5	15	1
5	14	1
\.


--
-- TOC entry 5096 (class 0 OID 16686)
-- Dependencies: 218
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, created_at, updated_at) FROM stdin;
1	Điện thoại	Các loại điện thoại thông minh và phổ thông	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
2	Laptop	Máy tính xách tay các loại	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
3	Tablet	Máy tính bảng	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
4	Phụ kiện	Các phụ kiện điện tử	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
5	123	123	2025-12-04 20:18:44.471636	2025-12-04 20:18:44.471636
\.


--
-- TOC entry 5102 (class 0 OID 16720)
-- Dependencies: 224
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, full_name, phone, email, address, password_hash, created_at, updated_at) FROM stdin;
1	Phạm Thị D	0912345678	ptd@gmail.com	444 Đường GHI, Q4, TP.HCM	$2a$10$N9qo8uLOickgx2ZMRZoMye.KB1T7Kb3QJ8YF5dYV7d6u5t2YV5XyO	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
2	Hoàng Văn E	0912345679	hve@gmail.com	555 Đường JKL, Q5, TP.HCM	$2a$10$N9qo8uLOickgx2ZMRZoMye.KB1T7Kb3QJ8YF5dYV7d6u5t2YV5XyO	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
3	Võ Thị F	0912345680	vtf@gmail.com	666 Đường MNO, Q6, TP.HCM	$2a$10$N9qo8uLOickgx2ZMRZoMye.KB1T7Kb3QJ8YF5dYV7d6u5t2YV5XyO	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
5	Cao Trường Phúc	0395278916	caophuc1909@gmail.com	Cổ Nhuế, Bắc Từ Liêm, Hà Nội	$2b$12$LnDNlNpnFKVEoopqGV7eHuGbX8RWiD67Kza4yleZQFZ./rGLZwyvq	2025-12-04 15:16:35.960759	2025-12-04 15:16:35.960759
\.


--
-- TOC entry 5119 (class 0 OID 25556)
-- Dependencies: 241
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discounts (discount_id, discount_name, discount_description, discount_start_date, discount_end_date, discount_amount, discount_is_display, discount_img) FROM stdin;
\.


--
-- TOC entry 5100 (class 0 OID 16706)
-- Dependencies: 222
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, full_name, phone, email, address, role, created_at, updated_at, is_active) FROM stdin;
1	Nguyễn Văn A	0901234567	nva@company.com	111 Đường ABC, Q1, TP.HCM	manager	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582	t
2	Trần Thị B	0901234568	ttb@company.com	222 Đường XYZ, Q2, TP.HCM	staff	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582	t
3	Lê Văn C	0901234569	lvc@company.com	333 Đường DEF, Q3, TP.HCM	staff	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582	t
\.


--
-- TOC entry 5121 (class 0 OID 25576)
-- Dependencies: 243
-- Data for Name: feedback_imgs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feedback_imgs (feedback_img_id, feedback_id, feedback_img_name, feedback_img_is_display) FROM stdin;
\.


--
-- TOC entry 5120 (class 0 OID 25565)
-- Dependencies: 242
-- Data for Name: feedbacks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feedbacks (feedback_id, product_variant_id, customer_id, order_id, feedback_date, feedback_rate, feedback_content, feedback_is_display) FROM stdin;
\.


--
-- TOC entry 5114 (class 0 OID 16836)
-- Dependencies: 236
-- Data for Name: import_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.import_items (id, import_id, product_id, quantity, unit_cost, created_at) FROM stdin;
1	1	1	10	1800000.00	2025-09-28 23:38:24.32582
2	1	3	5	2500000.00	2025-09-28 23:38:24.32582
3	2	2	10	1500000.00	2025-09-28 23:38:24.32582
4	2	6	10	1000000.00	2025-09-28 23:38:24.32582
5	3	4	10	2000000.00	2025-09-28 23:38:24.32582
6	1	1	1	1800000.00	2025-12-05 17:37:12.100637
\.


--
-- TOC entry 5110 (class 0 OID 16796)
-- Dependencies: 232
-- Data for Name: imports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.imports (id, supplier_id, employee_id, import_date, total_cost, created_at, updated_at) FROM stdin;
1	1	1	2025-09-28 23:38:24.32582	18000000.00	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
2	2	2	2025-09-28 23:38:24.32582	15000000.00	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
3	3	3	2025-09-28 23:38:24.32582	20000000.00	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
4	1	1	2025-12-05 17:37:33.056112	200000000.00	2025-12-05 17:37:33.056112	2025-12-05 17:37:33.056112
\.


--
-- TOC entry 5122 (class 0 OID 25580)
-- Dependencies: 244
-- Data for Name: notification_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_types (notification_type_id, notification_type_name, notification_type_img) FROM stdin;
\.


--
-- TOC entry 5123 (class 0 OID 25583)
-- Dependencies: 245
-- Data for Name: order_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_details (order_id, product_variant_id, order_detail_quantity, order_detail_price_before, order_detail_price_after) FROM stdin;
\.


--
-- TOC entry 5112 (class 0 OID 16818)
-- Dependencies: 234
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, quantity, unit_price, created_at) FROM stdin;
1	1	1	1	2200000.00	2025-09-28 23:38:24.32582
2	2	3	1	3200000.00	2025-09-28 23:38:24.32582
3	2	5	1	1500000.00	2025-09-28 23:38:24.32582
4	3	6	1	1300000.00	2025-09-28 23:38:24.32582
5	4	5	1	1500000.00	2025-12-04 15:35:06.355886
6	4	6	1	1300000.00	2025-12-04 15:35:06.367506
7	5	5	1	1500000.00	2025-12-04 15:35:09.139923
8	5	6	1	1300000.00	2025-12-04 15:35:09.143801
9	6	5	1	1500000.00	2025-12-05 23:47:38.63631
10	6	6	1	1300000.00	2025-12-05 23:47:38.65691
11	6	4	1	2500000.00	2025-12-05 23:47:38.667973
12	6	3	1	3200000.00	2025-12-05 23:47:38.676318
13	6	2	1	1900000.00	2025-12-05 23:47:38.682054
14	6	1	1	2200000.00	2025-12-05 23:47:38.685233
15	6	8	1	6.00	2025-12-05 23:47:38.689332
16	7	5	1	1500000.00	2025-12-07 02:03:29.008252
17	7	6	1	1300000.00	2025-12-07 02:03:29.028024
18	7	4	1	2500000.00	2025-12-07 02:03:29.032807
19	7	3	1	3200000.00	2025-12-07 02:03:29.037297
20	7	2	1	1900000.00	2025-12-07 02:03:29.043185
21	7	1	1	2200000.00	2025-12-07 02:03:29.047398
22	7	8	1	6.00	2025-12-07 02:03:29.051098
23	7	15	1	4500000.00	2025-12-07 02:03:29.054838
24	7	14	1	4500000.00	2025-12-07 02:03:29.060698
25	8	5	1	1500000.00	2025-12-07 02:04:18.386882
26	8	6	1	1300000.00	2025-12-07 02:04:18.404015
27	8	4	1	2500000.00	2025-12-07 02:04:18.411902
28	8	3	1	3200000.00	2025-12-07 02:04:18.416732
29	8	2	1	1900000.00	2025-12-07 02:04:18.424544
30	8	1	1	2200000.00	2025-12-07 02:04:18.430361
31	8	8	1	6.00	2025-12-07 02:04:18.437389
32	8	15	1	4500000.00	2025-12-07 02:04:18.444704
33	8	14	1	4500000.00	2025-12-07 02:04:18.448998
34	9	5	1	1500000.00	2025-12-07 15:22:30.293108
35	9	4	1	2500000.00	2025-12-07 15:22:30.302997
36	9	2	1	1900000.00	2025-12-07 15:22:30.309248
37	9	14	1	4500000.00	2025-12-07 15:22:30.314598
\.


--
-- TOC entry 5108 (class 0 OID 16773)
-- Dependencies: 230
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, customer_id, created_at, total_amount, status, updated_at) FROM stdin;
2	2	2025-09-28 23:38:24.32582	5700000.00	cancelled	2025-09-28 23:38:24.32582
1	2	2025-09-28 23:38:24.32582	0.00	cancelled	2025-09-28 23:38:24.32582
3	3	2025-09-28 23:38:24.32582	1300000.00	cancelled	2025-09-28 23:38:24.32582
8	5	2025-12-07 02:04:18.325273	21600006.00	successful	2025-12-07 02:04:18.325273
7	5	2025-12-07 02:03:28.947874	21600006.00	successful	2025-12-07 02:03:28.947874
6	2	2025-12-05 23:47:38.578811	0.00	successful	2025-12-05 23:47:38.578811
5	2	2025-12-04 15:35:09.13511	0.00	successful	2025-12-04 15:35:09.13511
4	2	2025-12-04 15:35:06.321803	0.00	successful	2025-12-04 15:35:06.321803
9	5	2025-12-07 15:22:30.243044	10400000.00	cancelled	2025-12-07 15:22:30.243044
\.


--
-- TOC entry 5124 (class 0 OID 25592)
-- Dependencies: 246
-- Data for Name: paying_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paying_methods (paying_method_id, paying_method_name, paying_method_is_display) FROM stdin;
\.


--
-- TOC entry 5106 (class 0 OID 16756)
-- Dependencies: 228
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, product_id, image_path, created_at, updated_at) FROM stdin;
9	1	20251205_105727_Screenshot 2025-09-15 220213.png	2025-12-05 10:57:27.792071	2025-12-05 10:57:27.792071
1	1	20251205_105727_Screenshot 2025-09-15 220213.png	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
2	1	20251205_105727_Screenshot 2025-09-15 220213.png	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
3	2	20251205_105727_Screenshot 2025-09-15 220213.png	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
4	3	20251205_105727_Screenshot 2025-09-15 220213.png	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
5	4	20251205_105727_Screenshot 2025-09-15 220213.png	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
6	5	20251205_105727_Screenshot 2025-09-15 220213.png	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
7	6	20251205_105727_Screenshot 2025-09-15 220213.png	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
10	1	20251206_171426_Screenshot 2025-09-13 134720.png	2025-12-06 17:14:26.664491	2025-12-06 17:14:26.664491
11	14	20251206_173200_Screenshot 2025-09-13 141327.png	2025-12-06 17:32:00.515639	2025-12-06 17:32:00.515639
12	16	20251206_173611_Screenshot 2025-09-13 203854.png	2025-12-06 17:36:11.20078	2025-12-06 17:36:11.20078
\.


--
-- TOC entry 5104 (class 0 OID 16733)
-- Dependencies: 226
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, category_id, supplier_id, description, cost_price, sell_price, stock_quantity, warranty_months, created_at, updated_at) FROM stdin;
9	Máy lọc nước Kangaroo	2	1	\N	3000000.00	4500000.00	20	12	2025-12-06 17:24:11.671124	2025-12-06 17:24:11.671124
10	Máy lọc nước Kangaro	2	1	\N	3000000.00	4500000.00	20	12	2025-12-06 17:24:51.662914	2025-12-06 17:24:51.662914
11	Máy lọc nước Kagaro	2	1	\N	3000000.00	4500000.00	20	12	2025-12-06 17:28:44.294631	2025-12-06 17:28:44.294631
12	Máy lọc nước Kaaro	2	1	\N	3000000.00	4500000.00	20	12	2025-12-06 17:29:01.416906	2025-12-06 17:29:01.416906
13	Máy lọc nước Karo	2	1	\N	3000000.00	4500000.00	20	12	2025-12-06 17:29:13.823522	2025-12-06 17:29:13.823522
16	123	2	2	123	100000.00	200000.00	10	10	2025-12-06 17:36:11.191657	2025-12-06 17:36:11.191657
6	Samsung Tab S8	3	2	Máy tính bảng Samsung Tab S8	1000000.00	1300000.00	15	12	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
3	MacBook Air M2	2	1	Laptop Apple MacBook Air M2 13 inch	2500000.00	3200000.00	17	24	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
1	iPhone 14 Pro	1	1	Điện thoại iPhone 14 Pro 128GB	1800000.00	2200000.00	47	12	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
8	zxczzxcz	5	3	qew	5.00	6.00	228	123	2025-12-04 20:20:12.656578	2025-12-04 20:20:12.656578
15	Máy lọc nước K	2	1	\N	3000000.00	4500000.00	18	12	2025-12-06 17:32:39.780858	2025-12-06 17:32:39.780858
5	iPad Air 5	3	1	Máy tính bảng iPad Air 5 64GB	1200000.00	1500000.00	19	12	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
4	Dell XPS 13	2	3	Laptop Dell XPS 13 2023	2000000.00	2500000.00	11	24	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
2	Samsung Galaxy S23	1	2	Điện thoại Samsung Galaxy S23 256GB	1500000.00	1900000.00	26	12	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
14	Máy lọc nước Ka	2	1	\N	3000000.00	4500000.00	17	12	2025-12-06 17:32:00.456489	2025-12-06 17:32:00.456489
\.


--
-- TOC entry 5098 (class 0 OID 16697)
-- Dependencies: 220
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, address, phone, email, created_at, updated_at) FROM stdin;
1	Công ty ABC	123 Đường Lê Lợi, Q1, TP.HCM	02838234567	contact@abc.com	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
2	Công ty XYZ	456 Đường Nguyễn Huệ, Q1, TP.HCM	02838234568	info@xyz.com	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
3	Công ty DEF	789 Đường Hai Bà Trưng, Q3, TP.HCM	02838234569	sales@def.com	2025-09-28 23:38:24.32582	2025-09-28 23:38:24.32582
\.


--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 237
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accounts_id_seq', 5, true);


--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 217
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 223
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 5, true);


--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 221
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 3, true);


--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 235
-- Name: import_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.import_items_id_seq', 7, true);


--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 231
-- Name: imports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.imports_id_seq', 4, true);


--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 233
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 37, true);


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 229
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 9, true);


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 227
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_id_seq', 12, true);


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 225
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 16, true);


--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 219
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 3, true);


--
-- TOC entry 4928 (class 2606 OID 16883)
-- Name: accounts accounts_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_customer_id_key UNIQUE (customer_id);


--
-- TOC entry 4930 (class 2606 OID 16881)
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 17002)
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id_customer, id_product);


--
-- TOC entry 4891 (class 2606 OID 16695)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4901 (class 2606 OID 16731)
-- Name: customers customers_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_phone_key UNIQUE (phone);


--
-- TOC entry 4903 (class 2606 OID 16729)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4895 (class 2606 OID 16716)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 4926 (class 2606 OID 16842)
-- Name: import_items import_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_items
    ADD CONSTRAINT import_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 16804)
-- Name: imports imports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imports
    ADD CONSTRAINT imports_pkey PRIMARY KEY (id);


--
-- TOC entry 4924 (class 2606 OID 16824)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4917 (class 2606 OID 16781)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4913 (class 2606 OID 16765)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4910 (class 2606 OID 16742)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4893 (class 2606 OID 16704)
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- TOC entry 4905 (class 2606 OID 16854)
-- Name: customers unique_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- TOC entry 4897 (class 2606 OID 16860)
-- Name: employees unique_email_e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT unique_email_e UNIQUE (email);


--
-- TOC entry 4907 (class 2606 OID 16856)
-- Name: customers unique_phone; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT unique_phone UNIQUE (phone);


--
-- TOC entry 4899 (class 2606 OID 16858)
-- Name: employees unique_phone_e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT unique_phone_e UNIQUE (phone);


--
-- TOC entry 4919 (class 1259 OID 16816)
-- Name: imports_employee_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX imports_employee_id_index ON public.imports USING btree (employee_id);


--
-- TOC entry 4922 (class 1259 OID 16815)
-- Name: imports_supplier_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX imports_supplier_id_index ON public.imports USING btree (supplier_id);


--
-- TOC entry 4915 (class 1259 OID 16792)
-- Name: orders_customer_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_customer_id_index ON public.orders USING btree (customer_id);


--
-- TOC entry 4918 (class 1259 OID 16794)
-- Name: orders_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_index ON public.orders USING btree (status);


--
-- TOC entry 4914 (class 1259 OID 16771)
-- Name: product_images_product_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_images_product_id_index ON public.product_images USING btree (product_id);


--
-- TOC entry 4908 (class 1259 OID 16753)
-- Name: products_category_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_category_id_index ON public.products USING btree (category_id);


--
-- TOC entry 4911 (class 1259 OID 16754)
-- Name: products_supplier_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_supplier_id_index ON public.products USING btree (supplier_id);


--
-- TOC entry 4947 (class 2620 OID 25589)
-- Name: order_details delete_before_order_details; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER delete_before_order_details BEFORE DELETE ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.delete_before_order_details_func();


--
-- TOC entry 4946 (class 2620 OID 25575)
-- Name: feedbacks insert_after_feedbacks; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER insert_after_feedbacks AFTER INSERT ON public.feedbacks FOR EACH ROW EXECUTE FUNCTION public.insert_after_feedbacks_func();


--
-- TOC entry 4948 (class 2620 OID 25591)
-- Name: order_details insert_before_order_details; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER insert_before_order_details BEFORE INSERT ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.insert_before_order_details_func();


--
-- TOC entry 4949 (class 2620 OID 25597)
-- Name: order_details update_before_order_details; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_before_order_details BEFORE UPDATE ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.update_before_order_details_func();


--
-- TOC entry 4943 (class 2606 OID 16884)
-- Name: accounts accounts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- TOC entry 4944 (class 2606 OID 17003)
-- Name: cart fk_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT fk_customer FOREIGN KEY (id_customer) REFERENCES public.customers(id);


--
-- TOC entry 4945 (class 2606 OID 17008)
-- Name: cart fk_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT fk_product FOREIGN KEY (id_product) REFERENCES public.products(id);


--
-- TOC entry 4941 (class 2606 OID 16843)
-- Name: import_items import_items_import_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_items
    ADD CONSTRAINT import_items_import_id_fkey FOREIGN KEY (import_id) REFERENCES public.imports(id);


--
-- TOC entry 4942 (class 2606 OID 16848)
-- Name: import_items import_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.import_items
    ADD CONSTRAINT import_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4937 (class 2606 OID 16810)
-- Name: imports imports_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imports
    ADD CONSTRAINT imports_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- TOC entry 4938 (class 2606 OID 16805)
-- Name: imports imports_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imports
    ADD CONSTRAINT imports_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- TOC entry 4939 (class 2606 OID 16825)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 4940 (class 2606 OID 16830)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4936 (class 2606 OID 16782)
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 4935 (class 2606 OID 34048)
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4933 (class 2606 OID 16743)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 4934 (class 2606 OID 16748)
-- Name: products products_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


-- Completed on 2025-12-08 00:09:15

--
-- PostgreSQL database dump complete
--

\unrestrict 26hZlUvcndcyWtW0maOya3OCWFE9mCVN3L6vpXR0pkqM1fAPIN98xvj9dPkKF0K

