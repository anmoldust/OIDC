package com.oidcdemo.backend.mapper;

import com.oidcdemo.backend.dto.UserDto;
import com.oidcdemo.backend.model.User;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * MapStruct mapper for User ↔ DTO conversions.
 * Spring component model allows injection via @Autowired / constructor injection.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto.Response toResponse(User user);

    User toEntity(UserDto.CreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UserDto.UpdateRequest request, @MappingTarget User user);
}
