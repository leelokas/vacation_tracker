package com.reach_u.vacation.repository;

import com.reach_u.vacation.domain.Authority;
import com.reach_u.vacation.domain.User;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by tanel
 */
public class UserSpecifications {

    public static Specification<User> byQuery(String firstName, String lastName, String login, String manager, Authority auth){

        return new Specification<User>() {
            @Override
            public Predicate toPredicate(Root<User> root, CriteriaQuery<?> criteriaQuery, CriteriaBuilder criteriaBuilder) {
                List<Predicate> expressions = new ArrayList<>();

                if (firstName != null) {
                    expressions.add(criteriaBuilder.notEqual(
                            criteriaBuilder.locate(criteriaBuilder.lower(root.get("firstName")), firstName.toLowerCase(), 0), 0)
                    );
                }
                if (lastName != null) {
                    expressions.add(criteriaBuilder.notEqual(
                            criteriaBuilder.locate(criteriaBuilder.lower(root.get("lastName")), lastName.toLowerCase(), 0), 0)
                    );
                }
                if (login != null) {
                    expressions.add(criteriaBuilder.notEqual(
                            criteriaBuilder.locate(criteriaBuilder.lower(root.get("login")), login.toLowerCase(), 0), 0)
                    );
                }
                if (manager != null) {
                    expressions.add(criteriaBuilder.equal(root.get("manager").get("login"), manager));
                }
                if (auth != null) {
                    expressions.add(criteriaBuilder.isMember(auth, root.get("authorities")));
                }

                expressions.add(criteriaBuilder.notEqual(root.get("login"), "system"));
                expressions.add(criteriaBuilder.notEqual(root.get("login"), "anonymoususer"));

                return criteriaBuilder.and(expressions.toArray(new Predicate[0]));
            }
        };
    }
}
