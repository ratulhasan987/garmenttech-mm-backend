import { useMemo, useState, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { AppModal } from '@/components/ui/modal/app-modal';
import { Button } from '@/components/ui/button';
type Warehouse = { id: number; name: string };
type Product = { id: number; code: string; name: string; unit: string };
type Item = {
    item_id: number;
    unit: string;
    quantity: number;
    unit_price: number;
    product_code: string;
    product_name: string;
};
type Form = {
    from_warehouse_id: string;
    to_warehouse_id: string;
    transfer_date: string;
    transportation_cost: string;
    note: string;
    items: Item[];
};
type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    warehouses: Warehouse[];
    products: Product[];
};
const today = () => {
    const d = new Date(),
        o = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - o).toISOString().slice(0, 10);
};
export default function StockTransferModal({
    open,
    onOpenChange,
    warehouses,
    products,
}: Props) {
    const [productId, setProductId] = useState(''),
        [qty, setQty] = useState('1'),
        [price, setPrice] = useState('0'),
        [localError, setLocalError] = useState<string | null>(null);
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<Form>({
            from_warehouse_id: '',
            to_warehouse_id: '',
            transfer_date: today(),
            transportation_cost: '0',
            note: '',
            items: [],
        });
    const selected = useMemo(
        () => new Set(data.items.map((x) => x.item_id)),
        [data.items],
    );
    const close = () => {
        if (processing) return;
        reset();
        clearErrors();
        setProductId('');
        setQty('1');
        setPrice('0');
        setLocalError(null);
        onOpenChange(false);
    };
    const add = () => {
        const p = products.find((x) => x.id === Number(productId));
        if (!p) return setLocalError('Please select a product.');
        if (selected.has(p.id))
            return setLocalError('This product is already added.');
        if (!p.unit)
            return setLocalError('Selected product does not have a unit.');
        const q = Number(qty),
            up = Number(price);
        if (q <= 0) return setLocalError('Quantity must be greater than 0.');
        if (up < 0) return setLocalError('Unit price cannot be negative.');
        setData('items', [
            ...data.items,
            {
                item_id: p.id,
                unit: p.unit,
                quantity: q,
                unit_price: up,
                product_code: p.code,
                product_name: p.name,
            },
        ]);
        setProductId('');
        setQty('1');
        setPrice('0');
        setLocalError(null);
    };
    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (data.from_warehouse_id === data.to_warehouse_id)
            return setLocalError(
                'Source and destination warehouse must be different.',
            );
        if (!data.items.length) return setLocalError('Add at least one item.');
        post('/inventory/stock-transfers', {
            preserveScroll: true,
            onSuccess: close,
        });
    };
    return (
        <AppModal
            open={open}
            onOpenChange={(v) => (v ? onOpenChange(true) : close())}
            title="Create Stock Transfer"
            size="xl"
            centered={false}
            busy={processing}
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        appearance="outline"
                        onClick={close}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="stock-transfer-form"
                        disabled={processing}
                    >
                        {processing ? 'Saving...' : 'Save Draft'}
                    </Button>
                </>
            }
        >
            <form id="stock-transfer-form" onSubmit={submit}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">From Warehouse *</label>
                        <select
                            className={`form-select ${errors.from_warehouse_id ? 'is-invalid' : ''}`}
                            value={data.from_warehouse_id}
                            onChange={(e) =>
                                setData('from_warehouse_id', e.target.value)
                            }
                        >
                            <option value="">Select source warehouse</option>
                            {warehouses.map((x) => (
                                <option key={x.id} value={x.id}>
                                    {x.name}
                                </option>
                            ))}
                        </select>
                        {errors.from_warehouse_id && (
                            <div className="invalid-feedback">
                                {errors.from_warehouse_id}
                            </div>
                        )}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">To Warehouse *</label>
                        <select
                            className={`form-select ${errors.to_warehouse_id ? 'is-invalid' : ''}`}
                            value={data.to_warehouse_id}
                            onChange={(e) =>
                                setData('to_warehouse_id', e.target.value)
                            }
                        >
                            <option value="">
                                Select destination warehouse
                            </option>
                            {warehouses.map((x) => (
                                <option key={x.id} value={x.id}>
                                    {x.name}
                                </option>
                            ))}
                        </select>
                        {errors.to_warehouse_id && (
                            <div className="invalid-feedback">
                                {errors.to_warehouse_id}
                            </div>
                        )}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Transfer Date *</label>
                        <input
                            type="date"
                            className="form-control"
                            value={data.transfer_date}
                            onChange={(e) =>
                                setData('transfer_date', e.target.value)
                            }
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">
                            Transportation Cost
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control"
                            value={data.transportation_cost}
                            onChange={(e) =>
                                setData('transportation_cost', e.target.value)
                            }
                        />
                    </div>
                </div>
                <hr />
                <div className="row g-2 align-items-end">
                    <div className="col-md-5">
                        <label className="form-label">Product</label>
                        <select
                            className="form-select"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                        >
                            <option value="">Select product</option>
                            {products.map((x) => (
                                <option
                                    key={x.id}
                                    value={x.id}
                                    disabled={selected.has(x.id)}
                                >
                                    {x.code} - {x.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label">Quantity</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            className="form-control"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Unit Price</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                    <div className="col-md-2">
                        <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={add}
                        >
                            Add
                        </button>
                    </div>
                </div>
                {localError && (
                    <div className="text-danger small mt-2">{localError}</div>
                )}
                <div className="table-responsive mt-3">
                    <table className="table table-bordered align-middle">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Unit</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.length ? (
                                data.items.map((x, i) => (
                                    <tr key={x.item_id}>
                                        <td>
                                            <strong>{x.product_name}</strong>
                                            <div className="small text-muted">
                                                {x.product_code}
                                            </div>
                                        </td>
                                        <td>{x.unit}</td>
                                        <td>{x.quantity.toFixed(2)}</td>
                                        <td>{x.unit_price.toFixed(2)}</td>
                                        <td>
                                            {(
                                                x.quantity * x.unit_price
                                            ).toFixed(2)}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() =>
                                                    setData(
                                                        'items',
                                                        data.items.filter(
                                                            (_, n) => n !== i,
                                                        ),
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center text-muted py-3"
                                    >
                                        No items added.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {errors.items && (
                    <div className="text-danger small">{errors.items}</div>
                )}
                <div className="mt-3">
                    <label className="form-label">Note</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                    />
                    {errors.note && (
                        <div className="text-danger small">{errors.note}</div>
                    )}
                </div>
            </form>
        </AppModal>
    );
}
