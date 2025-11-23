import React, { useEffect, useState } from "react";
import api from "./api";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [history, setHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [file, setFile] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    unit: "",
    category: "",
    brand: "",
    stock: 0,
    image: "",
  });

  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  // ---------- API CALLS ----------
  const fetchProducts = async (options = {}) => {
    const params = {
      page,
      name: search || undefined,
      category: category || undefined,
      sortField,
      sortOrder,
      ...options,
    };
    const res = await api.get("/products", { params });
    setProducts(res.data);
  };

  const fetchHistory = async (id) => {
    const res = await api.get(`/products/${id}/history`);
    setHistory(res.data);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [page, sortField, sortOrder]);

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  // ---------- HANDLERS ----------
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
    fetchProducts({ name: e.target.value, page: 1 });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    setPage(1);
    fetchProducts({ category: value, page: 1 });
  };

  const beginEdit = (p) => {
    setEditingId(p.id);
    setEditRow({ ...p });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRow({});
  };

  const saveEdit = async () => {
    const res = await api.put(`/products/${editingId}`, editRow);
    setProducts((prev) =>
      prev.map((p) => (p.id === editingId ? res.data : p))
    );
    cancelEdit();
  };

  const deleteProduct = async (id, e) => {
    e.stopPropagation();
    await api.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
      setHistory([]);
    }
  };

  const onRowClick = (p) => {
    setSelectedProduct(p);
    fetchHistory(p.id);
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const importCSV = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("csvFile", file);
    await api.post("/products/import", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setFile(null);
    fetchProducts({ page: 1 });
  };

  const exportCSV = () => {
    window.open("http://localhost:4000/api/products/export");
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return "";
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  const renderStatus = (stock) => {
    const inStock = Number(stock) > 0;
    return (
      <span className={inStock ? "status in-stock" : "status out-stock"}>
        {inStock ? "In Stock" : "Out of Stock"}
      </span>
    );
  };

  const handleAddProduct = async () => {
    const payload = { ...newProduct, stock: Number(newProduct.stock || 0) };
    const res = await api.post("/products", payload);
    setProducts((prev) => [...prev, res.data]);
    setShowAdd(false);
    setNewProduct({
      name: "",
      unit: "",
      category: "",
      brand: "",
      stock: 0,
      image: "",
    });
  };

  // ---------- RENDER ----------
  return (
    <div className="app">
      <h2>Inventory Management System</h2>

      <header className="header">
        <div className="left">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={handleSearchChange}
          />

          <select value={category} onChange={handleCategoryChange}>
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="right">
          <button className="btn" onClick={() => setShowAdd(true)}>
            Add New Product
          </button>

          <label className="btn">
            Import
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleFileChange}
            />
          </label>

          <button className="btn" disabled={!file} onClick={importCSV}>
            Upload
          </button>

          <button className="btn" onClick={exportCSV}>
            Export
          </button>
        </div>
      </header>

      <div className="content">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th onClick={() => toggleSort("name")}>
                  Name{renderSortIcon("name")}
                </th>
                <th onClick={() => toggleSort("unit")}>
                  Unit{renderSortIcon("unit")}
                </th>
                <th onClick={() => toggleSort("category")}>
                  Category{renderSortIcon("category")}
                </th>
                <th onClick={() => toggleSort("brand")}>
                  Brand{renderSortIcon("brand")}
                </th>
                <th onClick={() => toggleSort("stock")}>
                  Stock{renderSortIcon("stock")}
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => {
                const isEditing = editingId === p.id;

                return (
                  <tr key={p.id} onClick={() => onRowClick(p)}>
                    <td>
                      {p.image ? (
                        <img src={p.image} alt="" className="thumb" />
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          value={editRow.name}
                          onChange={(e) =>
                            setEditRow({ ...editRow, name: e.target.value })
                          }
                        />
                      ) : (
                        p.name
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          value={editRow.unit}
                          onChange={(e) =>
                            setEditRow({ ...editRow, unit: e.target.value })
                          }
                        />
                      ) : (
                        p.unit
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          value={editRow.category}
                          onChange={(e) =>
                            setEditRow({
                              ...editRow,
                              category: e.target.value,
                            })
                          }
                        />
                      ) : (
                        p.category
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          value={editRow.brand}
                          onChange={(e) =>
                            setEditRow({ ...editRow, brand: e.target.value })
                          }
                        />
                      ) : (
                        p.brand
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editRow.stock}
                          onChange={(e) =>
                            setEditRow({
                              ...editRow,
                              stock: Number(e.target.value),
                            })
                          }
                        />
                      ) : (
                        p.stock
                      )}
                    </td>

                    <td>{renderStatus(p.stock)}</td>

                    <td onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <>
                          <button className="btn small" onClick={saveEdit}>
                            Save
                          </button>
                          <button className="btn small" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn small"
                            onClick={() => beginEdit(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn small danger"
                            onClick={(e) => deleteProduct(p.id, e)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination">
            <button
              className="btn"
              onClick={() => {
                if (page > 1) {
                  setPage(page - 1);
                }
              }}
            >
              Prev
            </button>
            <span>Page {page}</span>
            <button
              className="btn"
              onClick={() => {
                setPage(page + 1);
              }}
            >
              Next
            </button>
          </div>
        </div>

        <aside className={`sidebar ${selectedProduct ? "open" : ""}`}>
          {selectedProduct ? (
            <>
              <h3>History: {selectedProduct.name}</h3>
              <ul>
                {history.length === 0 && <li>No history yet.</li>}
                {history.map((h) => (
                  <li key={h.id}>
                    <strong>
                      {new Date(h.change_date).toLocaleString()}
                    </strong>
                    <br />
                    {h.old_quantity} → {h.new_quantity} (by{" "}
                    {h.user_info || "user"})
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>Select a product</p>
          )}
        </aside>
      </div>

      {showAdd && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Product</h3>

            <input
              placeholder="Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <input
              placeholder="Unit"
              value={newProduct.unit}
              onChange={(e) =>
                setNewProduct({ ...newProduct, unit: e.target.value })
              }
            />
            <input
              placeholder="Category"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
            />
            <input
              placeholder="Brand"
              value={newProduct.brand}
              onChange={(e) =>
                setNewProduct({ ...newProduct, brand: e.target.value })
              }
            />
            <input
              placeholder="Stock"
              type="number"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  stock: e.target.value,
                })
              }
            />
            <input
              placeholder="Image URL (optional)"
              value={newProduct.image}
              onChange={(e) =>
                setNewProduct({ ...newProduct, image: e.target.value })
              }
            />

            <div className="modal-actions">
              <button className="btn" onClick={handleAddProduct}>
                Save
              </button>
              <button className="btn danger" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
