import { Link } from "react-router-dom";
import ProductCard from "../../component/ui/ProductCard";
import Loading from "../../component/ui/Loading";
import "./Search.css";
import { useSearch } from "../../hooks/features/home/useSearch";

function Search() {
    const { searchQuery, isNavigating, priceRange, setPriceRange, sortBy, setSortBy, isLoading, currentProductsToDisplay, handleProductClick, currentPage, setCurrentPage, totalPages, getPaginationGroup } = useSearch();

    return (
        <div className="search-page-container">
            {isNavigating && <Loading fullScreen={true} />}
            {/* Sidebar Bộ lọc */}
            <aside className="filter-sidebar">
                <div className="filter-group">
                    <h3 className="filter-title">Khoảng Giá</h3>

                    <div className="filter-option">
                        <input
                            type="radio"
                            id="price-all"
                            name="price"
                            value="all"
                            checked={priceRange === "all"}
                            onChange={(e) => setPriceRange(e.target.value)}
                        />
                        <label htmlFor="price-all">Tất cả mức giá</label>
                    </div>

                    <div className="filter-option">
                        <input
                            type="radio"
                            id="price-under-10m"
                            name="price"
                            value="under-10m"
                            checked={priceRange === "under-10m"}
                            onChange={(e) => setPriceRange(e.target.value)}
                        />
                        <label htmlFor="price-under-10m">Dưới 10 triệu</label>
                    </div>

                    <div className="filter-option">
                        <input
                            type="radio"
                            id="price-10m-20m"
                            name="price"
                            value="10m-20m"
                            checked={priceRange === "10m-20m"}
                            onChange={(e) => setPriceRange(e.target.value)}
                        />
                        <label htmlFor="price-10m-20m">Từ 10 - 20 triệu</label>
                    </div>

                    <div className="filter-option">
                        <input
                            type="radio"
                            id="price-over-20m"
                            name="price"
                            value="over-20m"
                            checked={priceRange === "over-20m"}
                            onChange={(e) => setPriceRange(e.target.value)}
                        />
                        <label htmlFor="price-over-20m">Trên 20 triệu</label>
                    </div>
                </div>
            </aside>

            {/* Vùng hiển thị kết quả chính */}
            <main className="product-list-main">
                <div className="list-header">
                    <h1 className="page-title">
                        {searchQuery 
                            ? <>Kết quả tìm kiếm cho: <span className="keyword-highlight">"{searchQuery}"</span></>
                            : "Tất cả sản phẩm"
                        }
                    </h1>

                    <div className="sort-container">
                        <label htmlFor="sort-by">Sắp xếp: </label>
                        <select
                            id="sort-by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="default">Mặc định</option>
                            <option value="price-asc">Giá: Tăng dần</option>
                            <option value="price-desc">Giá: Giảm dần</option>
                        </select>
                    </div>
                </div>

                <div className="product-grid">
                    {isLoading ? (
                        <p>Đang tải dữ liệu...</p>
                    ) : currentProductsToDisplay.length > 0 ? (
                        currentProductsToDisplay.map((product) => (
                            <Link to={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }} onClick={(e) => handleProductClick(e, product.id)}>
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    imageUrl={product.imageUrl}
                                    rating={product.rating}
                                    reviewCount={product.reviewCount}
                                    isOutOfStock={product.isOutOfStock}
                                />
                            </Link>
                        ))
                    ) : (
                        <div className="no-products-found">
                            <p>Rất tiếc, không tìm thấy sản phẩm nào phù hợp với từ khóa <strong>"{searchQuery}"</strong>.</p>
                            <p>Vui lòng thử lại bằng từ khóa khác hoặc điều chỉnh bộ lọc giá.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="pagination-container" style={{ marginTop: '30px' }}>
                        <button 
                            className="pagination-btn" 
                            onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </button>
                        
                        {getPaginationGroup().map((page: number | string, index: number) => (
                            <button 
                                key={index} 
                                className={`pagination-btn ${currentPage === page ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                                onClick={() => { if (typeof page === 'number') { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                                disabled={page === '...'}
                            >
                                {page}
                            </button>
                        ))}
                        <button 
                            className="pagination-btn" 
                            onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Search;