import PageTitle from '@/components/page-title';
import { Head } from '@inertiajs/react';
import { useMemo, useState, type FormEvent } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardFooter } from '@/components/ui/card';

type Warehouse = { id: number; name: string };
type Product = { id: number; code: string; name: string; unit: string };
type Item = {
    item_id: number;
    unit: string;
    adjustment_type: 'increase' | 'decrease';
    quantity: number;
    product_code: string;
    product_name: string;
};
type Form = {
    warehouse_id: string;
    adjustment_date: string;
    reason: string;
    note: string;
    items: Item[];
};
type Props = {
    warehouses: Warehouse[];
    products: Product[];
};

const today = () => {
    const d = new Date(),
        o = d.getTimezoneOffset() * 60000;

    return new Date(d.getTime() - o).toISOString().slice(0, 10);
};

export default function CreateAdjustmentPage({ warehouses, products }: Props) {
    const [productId, setProductId] = useState(''),
        [kind, setKind] = useState<'increase' | 'decrease'>('increase'),
        [qty, setQty] = useState('1'),
        [localError, setLocalError] = useState<string | null>(null);
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<Form>({
            warehouse_id: '',
            adjustment_date: today(),
            reason: '',
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
        setKind('increase');
        setQty('1');
        setLocalError(null);
    };

    const add = () => {
        const p = products.find((x) => x.id === Number(productId));

        if (!p) return setLocalError('Please select a product.');

        if (selected.has(p.id))
            return setLocalError('This product is already added.');

        if (!p.unit)
            return setLocalError('Selected product does not have a unit.');

        const q = Number(qty);

        if (q <= 0) return setLocalError('Quantity must be greater than 0.');
        setData('items', [
            ...data.items,
            {
                item_id: p.id,
                unit: p.unit,
                adjustment_type: kind,
                quantity: q,
                product_code: p.code,
                product_name: p.name,
            },
        ]);
        setProductId('');
        setKind('increase');
        setQty('1');
        setLocalError(null);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!data.items.length) return setLocalError('Add at least one item.');

        post('/inventory/stock-adjustments', {
            preserveScroll: true,
            onSuccess: close,
        });
    };

    return (
        <>
            <Head title="Create Adjustment" />
            <PageTitle title="Create Adjustment" />
            <div className="container-fluid">
                <Card>
                    <CardBody>
                        <form id="stock-adjustment-form" onSubmit={submit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Warehouse *
                                    </label>
                                    <select
                                        className={`form-select ${errors.warehouse_id ? 'is-invalid' : ''}`}
                                        value={data.warehouse_id}
                                        onChange={(e) =>
                                            setData(
                                                'warehouse_id',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select warehouse
                                        </option>
                                        {warehouses.map((x) => (
                                            <option key={x.id} value={x.id}>
                                                {x.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.warehouse_id && (
                                        <div className="invalid-feedback">
                                            {errors.warehouse_id}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Adjustment Date *
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={data.adjustment_date}
                                        onChange={(e) =>
                                            setData(
                                                'adjustment_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Reason</label>
                                    <input
                                        className="form-control"
                                        value={data.reason}
                                        onChange={(e) =>
                                            setData('reason', e.target.value)
                                        }
                                        placeholder="e.g. Physical count correction"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="row g-2 align-items-end">
                                <div className="col-md-5">
                                    <label className="form-label">
                                        Product
                                    </label>
                                    <select
                                        className="form-select"
                                        value={productId}
                                        onChange={(e) =>
                                            setProductId(e.target.value)
                                        }
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
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        value={kind}
                                        onChange={(e) =>
                                            setKind(
                                                e.target.value as
                                                    'increase' | 'decrease',
                                            )
                                        }
                                    >
                                        <option value="increase">
                                            Increase
                                        </option>
                                        <option value="decrease">
                                            Decrease
                                        </option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        className="form-control"
                                        value={qty}
                                        onChange={(e) => setQty(e.target.value)}
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
                                <div className="text-danger small mt-2">
                                    {localError}
                                </div>
                            )}
                            <div className="table-responsive mt-3">
                                <table className="table table-bordered align-middle">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Unit</th>
                                            <th>Type</th>
                                            <th>Quantity</th>
                                            <th />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.length ? (
                                            data.items.map((x, i) => (
                                                <tr key={x.item_id}>
                                                    <td>
                                                        <strong>
                                                            {x.product_name}
                                                        </strong>
                                                        <div className="small text-muted">
                                                            {x.product_code}
                                                        </div>
                                                    </td>
                                                    <td>{x.unit}</td>
                                                    <td>
                                                        <span
                                                            className={`badge ${x.adjustment_type === 'increase' ? 'bg-success' : 'bg-danger'}`}
                                                        >
                                                            {x.adjustment_type}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {x.quantity.toFixed(2)}
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() =>
                                                                setData(
                                                                    'items',
                                                                    data.items.filter(
                                                                        (
                                                                            _,
                                                                            n,
                                                                        ) =>
                                                                            n !==
                                                                            i,
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
                                                    colSpan={5}
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
                                <div className="text-danger small">
                                    {errors.items}
                                </div>
                            )}
                            <div className="mt-3">
                                <label className="form-label">Note</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={data.note}
                                    onChange={(e) =>
                                        setData('note', e.target.value)
                                    }
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    appearance="outline"
                                    onClick={() => {
                                        close();
                                        router.visit(
                                            '/inventory/stock-adjustments',
                                        );
                                    }}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    form="stock-adjustment-form"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : 'Save Draft'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
