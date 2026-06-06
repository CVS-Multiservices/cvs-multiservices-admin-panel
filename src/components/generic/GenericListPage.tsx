import React, { useState, useMemo } from 'react';
import { Search, Plus, Package, X } from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface ListPageProps<T> {
  title: string;
  collection: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderForm: (item: T | null, onSave: (data: any) => void) => React.ReactNode;
  emptyState?: React.ReactNode;
  modalOpen: boolean;
  modalType: 'add' | 'edit';
  editingItem: any;
  deleteConfirm: { open: boolean; id: any; collection: string };
  openAddModal: () => void;
  setModalOpen: (v: boolean) => void;
  setEditingItem: (v: any) => void;
  setDeleteConfirm: (v: { open: boolean; id: any; collection: string }) => void;
  handleAdd: (collection: string, item: any) => void;
  handleEdit: (collection: string, id: any, item: any) => void;
  handleDelete: (collection: string, id: any) => void;
}

export function GenericListPage<T extends { id: any }>({
  title,
  collection,
  items,
  renderItem,
  renderForm,
  emptyState,
  modalOpen,
  modalType,
  editingItem,
  deleteConfirm,
  openAddModal,
  setModalOpen,
  setEditingItem,
  setDeleteConfirm,
  handleAdd,
  handleEdit,
  handleDelete,
}: ListPageProps<T>) {
  const [localSearch, setLocalSearch] = useState('');

  const filteredItems = useMemo(() => {
    if (!localSearch) return items;
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(localSearch.toLowerCase())
    );
  }, [items, localSearch]);

  // Move form state outside of renderForm
  const [ , setFormData] = useState<any>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search..."
              className="pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add New</span>
          </button>
        </div>
      </div>

      {/* Items */}
      {filteredItems.length === 0 ? (
        emptyState || (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">No items found</h4>
            <p className="text-slate-500 text-sm mb-4">
              {localSearch ? 'Try adjusting your search' : 'Get started by creating your first item'}
            </p>
            {!localSearch && (
              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add First Item
              </button>
            )}
          </div>
        )
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => renderItem(item, index))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalType === 'add' ? 'Add New' : 'Edit'} {title.slice(0, -1)}
              </h3>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingItem(null);
                  setFormData(null); // Reset form data
                }}
                className="p-2 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
              {renderForm(
                editingItem,
                (data: any) => {
                  if (modalType === 'add') {
                    handleAdd(collection, data);
                  } else {
                    handleEdit(collection, editingItem.id, data);
                  }
                }
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={deleteConfirm.open && deleteConfirm.collection === collection}
        onCancel={() => setDeleteConfirm({ open: false, id: null, collection: '' })}
        onConfirm={() => handleDelete(deleteConfirm.collection, deleteConfirm.id)}
      />
    </div>
  );
}