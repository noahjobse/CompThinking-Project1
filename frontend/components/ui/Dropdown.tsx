interface DropdownProps {
  notifications: string[];
}

export default function Dropdown({notifications}: DropdownProps) {
    return (
        <div className="flex flex-col mt-1 absolute right-0 w-72 max-h-96 rounded-lg overflow-hidden border shadow-xl bg-white ">
            <div className="p-3 bg-gray-700 text-center">
                <h3 className="text-md font-bold text-white">Notifications</h3>
            </div>

            {/* Notifications List*/}
            <div className="flex flex-1 px-2 pb-2 overflow-hidden">

                {/* List Container */}
                <ul className="w-full h-full overflow-y-auto thin-scrollbar">

                    {/* Notification */}
                    {notifications.map((notification, index) => (
                        <li key={index} className="list-none">
                            <div className="flex p-3 w-full h-16 bg-white border-b border-gray-400">
                                
                                    {/* Message */}
                                    <p className="text-left text-sm leading-5 w-full">
                                        {notification}
                                    </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}