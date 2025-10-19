import { useTheme } from "@/hooks/use-theme";
import { verifiedUsers } from "@/constants";
import { PencilLine, Trash } from "lucide-react";

const analytics = () => {
    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Verified Users</h1>
            <div className="card">
                <div className="card-header">
                    <p className="card-title">Users</p>
                </div>
                <div className="card-body p-0">
                    <div className="relative h-[700px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                        <table className="table">
                            <thead className="table-header">
                                <tr className="table-row">
                                    <th className="table-head">ID</th>
                                    <th className="table-head">Name</th>
                                    <th className="table-head">Email</th>
                                    <th className="table-head">Role</th>
                                    <th className="table-head">Virified On</th>
                                    <th className="table-head">Cars Listed</th>
                                    <th className="table-head">Status</th>
                                    <th className="table-head">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {verifiedUsers.map((product) => (
                                    <tr
                                        key={product.number}
                                        className="table-row"
                                    >
                                        <td className="table-cell">{product.number}</td>
                                        <td className="table-cell">
                                            <div className="flex w-max gap-x-4">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="size-14 rounded-full object-cover"
                                                />
                                                <div className="flex flex-col justify-center">
                                                    <p>{product.name}</p>
                                                    {/* <p className="font-normal text-slate-600 dark:text-slate-400">{product.description}</p> */}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">{product.email}</td>
                                        <td className="table-cell">{product.role}</td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-x-2">
                                                {product.verifiedOn}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-x-2">
                                                {product.carsListed}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-x-2">
                                                {product.status}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-x-4">
                                                <button className="text-blue-500 dark:text-blue-600">
                                                    <PencilLine size={20} />
                                                </button>
                                                <button className="text-red-500">
                                                    <Trash size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default analytics;
