export default function TestImage({ product }) {

    return (
        <div>
            <h1>Image Test Page</h1>

            <p>Image path from DB: {product.main_image}</p>

            <img
                src={`/${product.main_image}`}
                alt="Test Product"
                style={{ width: "400px", height: "400px", border: "1px solid red" }}
                onError={(e) => {
                    e.currentTarget.src = "/images/image.png";
                }}
            />
        </div>
    );
}
